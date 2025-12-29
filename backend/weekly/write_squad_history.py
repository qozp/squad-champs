"""
Calculate Weekly Scores Script for Squad Champs
Runs Monday morning (4 AM ET) to calculate previous week's scores
Gameweeks run Monday-Sunday, so this calculates the week that just ended
Also handles inactive player adjustments (bench swaps, captain promotion)
Run via GitHub Actions every Monday at 4 AM ET (after snapshot_squads.py)
"""

import os
from datetime import datetime, timezone
from zoneinfo import ZoneInfo
from supabase import create_client, Client
from typing import Optional, Dict, List, Tuple

# Initialize Supabase client
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_KEY")
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)


def get_gameweek_for_date(target_date) -> Optional[int]:
    """
    Return the gameweek number that target_date falls into.
    target_date should be a date object in Eastern Time
    """
    try:
        resp = supabase.table("gameweek")\
            .select("gameweek, start_date, end_date")\
            .execute()
        
        for gw in resp.data:
            from datetime import datetime
            start = datetime.strptime(gw["start_date"], "%Y-%m-%d").date()
            end = datetime.strptime(gw["end_date"], "%Y-%m-%d").date()
            if start <= target_date <= end:
                return gw["gameweek"]
        
        # If no match found, return None instead of defaulting to 1
        return None
    except Exception as e:
        print(f"Error in get_gameweek_for_date: {e}")
        return None


def get_completed_gameweek() -> Optional[int]:
    """
    Get the most recently completed gameweek (ended yesterday or earlier in ET)
    This ensures all games have been played and scored
    Uses Eastern Time since gameweeks are defined in ET
    """
    try:        
        eastern = ZoneInfo("America/New_York")
        now_et = datetime.now(eastern)
        today_et = now_et.date()
        
        print(f"Current time in ET: {now_et.strftime('%Y-%m-%d %H:%M:%S %Z')}")
        print(f"Looking for gameweek that ended before: {today_et}")
        
        response = supabase.table("gameweek")\
            .select("gameweek, start_date, end_date")\
            .lt("end_date", str(today_et))\
            .order("end_date", desc=True)\
            .limit(1)\
            .execute()
        
        if response.data:
            gameweek_data = response.data[0]
            print(f"Found completed gameweek: {gameweek_data['gameweek']} (ended {gameweek_data['end_date']})")
            return gameweek_data["gameweek"]
        
        print(f"No completed gameweek found before date: {today_et}")
        return None
    
    except Exception as e:
        print(f"Error fetching completed gameweek: {e}")
        return None


def check_if_scores_calculated(gameweek: int) -> bool:
    """Check if squad_history already exists for this gameweek"""
    try:
        response = supabase.table("squad_history")\
            .select("gameweek", count="exact")\
            .eq("gameweek", gameweek)\
            .limit(1)\
            .execute()
        
        exists = response.count > 0
        if exists:
            print(f"⚠️  Scores already calculated for gameweek {gameweek}")
        return exists
    
    except Exception as e:
        print(f"Error checking if scores exist: {e}")
        return False


def get_player_activity(gameweek: int) -> Dict[int, bool]:
    """
    Get which players were active (actually played minutes) during the gameweek
    Returns dict mapping player_id -> bool (True if active)
    A player is considered active only if they played minutes > 0
    """
    try:
        # Get all games in this gameweek
        games_response = supabase.table("game")\
            .select("id")\
            .eq("gameweek", gameweek)\
            .execute()
        
        if not games_response.data:
            print(f"⚠️  No games found for gameweek {gameweek}")
            return {}
        
        game_ids = [g["id"] for g in games_response.data]
        print(f"   Found {len(game_ids)} games in gameweek {gameweek}")
        
        # Get all player_game entries for these games
        # Since player_game only exists when minutes > 0, we don't need to filter
        player_games_response = supabase.table("player_game")\
            .select("player_id, minutes")\
            .in_("game_id", game_ids)\
            .execute()
        
        # Create set of active player IDs (those who played)
        active_players = set()
        if player_games_response.data:
            active_players = {pg["player_id"] for pg in player_games_response.data}
            print(f"   Sample of active players: {list(active_players)[:10]}")
        
        print(f"📊 Found {len(active_players)} active players in gameweek {gameweek}")
        return {pid: True for pid in active_players}
    
    except Exception as e:
        print(f"Error fetching player activity: {e}")
        return {}


def adjust_inactive_players(gameweek: int, active_players: Dict[int, bool]) -> int:
    """
    Adjust squad_history_player entries for inactive players:
    1. Move inactive starters to bench
    2. Promote active bench players to starting
    3. Handle captain/vice-captain promotions if needed
    
    Returns count of adjustments made
    """
    try:
        # Get all users' squad_history_player for this gameweek
        response = supabase.table("squad_history_player")\
            .select("*")\
            .eq("gameweek", gameweek)\
            .order("user_id")\
            .execute()
        
        if not response.data:
            print(f"⚠️  No squad history players found for gameweek {gameweek}")
            return 0
        
        adjustments_made = 0
        
        # Group by user_id
        from itertools import groupby
        by_user = groupby(response.data, key=lambda x: x["user_id"])
        
        for user_id, players_iter in by_user:
            players = list(players_iter)
            adjusted = adjust_user_squad(players, active_players, gameweek)
            adjustments_made += adjusted
        
        print(f"✅ Made {adjustments_made} inactive player adjustments")
        return adjustments_made
    
    except Exception as e:
        print(f"❌ Error adjusting inactive players: {e}")
        return 0


def adjust_user_squad(players: List[Dict], active_players: Dict[int, bool], gameweek: int) -> int:
    """
    Adjust a single user's squad for inactive players
    Returns number of adjustments made
    """
    starting = [p for p in players if p["is_starting"]]
    bench = [p for p in players if not p["is_starting"]]
    
    inactive_starters = [p for p in starting if p["player_id"] not in active_players]
    active_bench = [p for p in bench if p["player_id"] in active_players]
    
    if not inactive_starters:
        return 0  # No adjustments needed
    
    adjustments = 0
    user_id = players[0]["user_id"]
    
    # DEBUG: Print detailed info
    print(f"  👤 User {user_id[:8]}:")
    print(f"     Starting players: {[p['player_id'] for p in starting]}")
    print(f"     Bench players: {[p['player_id'] for p in bench]}")
    print(f"     Inactive starters: {[p['player_id'] for p in inactive_starters]}")
    print(f"     Active bench: {[p['player_id'] for p in active_bench]}")
    
    # Sort bench by bench_order to get substitution priority
    active_bench.sort(key=lambda x: x["bench_order"] or 999)
    
    # Match inactive starters with active bench players
    for i, inactive in enumerate(inactive_starters):
        if i < len(active_bench):
            sub_player = active_bench[i]
            
            # Swap: move inactive to bench, promote substitute to starting
            updates = []
            
            # Move inactive starter to bench
            updates.append({
                "player_id": inactive["player_id"],
                "user_id": user_id,
                "gameweek": gameweek,
                "is_starting": False,
                "bench_order": sub_player["bench_order"],  # Take sub's bench position
                "is_captain": False,
                "is_vice_captain": False,
            })
            
            # Promote bench player to starting
            updates.append({
                "player_id": sub_player["player_id"],
                "user_id": user_id,
                "gameweek": gameweek,
                "is_starting": True,
                "bench_order": None,
                "is_captain": inactive["is_captain"],  # Inherit captain status if applicable
                "is_vice_captain": inactive["is_vice_captain"],  # Inherit vice-captain status
            })
            
            # Execute updates
            for update in updates:
                supabase.table("squad_history_player")\
                    .update({
                        "is_starting": update["is_starting"],
                        "bench_order": update["bench_order"],
                        "is_captain": update["is_captain"],
                        "is_vice_captain": update["is_vice_captain"],
                    })\
                    .eq("player_id", update["player_id"])\
                    .eq("user_id", update["user_id"])\
                    .eq("gameweek", update["gameweek"])\
                    .execute()
            
            adjustments += 2
            print(f"    🔄 Subbed out inactive player {inactive['player_id']} for active player {sub_player['player_id']}")
        else:
            print(f"    ⚠️  No active bench player available to replace inactive player {inactive['player_id']}")
    
    return adjustments


def calculate_user_score(user_id: str, gameweek: int) -> Tuple[float, int, int]:
    """
    Calculate total score for a user's squad in a gameweek
    Returns (gameweek_points, trades_made, trade_penalty)
    """
    try:
        # Get squad_history_player entries for this user
        response = supabase.table("squad_history_player")\
            .select("player_id, is_starting, is_captain, is_vice_captain")\
            .eq("user_id", user_id)\
            .eq("gameweek", gameweek)\
            .execute()
        
        if not response.data:
            return 0.0, 0, 0
        
        # Get player scores from player_game
        player_scores = {}
        
        # Get all games in gameweek
        games_response = supabase.table("game")\
            .select("id")\
            .eq("gameweek", gameweek)\
            .execute()
        
        game_ids = [g["id"] for g in games_response.data] if games_response.data else []
        
        if game_ids:
            # Get all player_game scores for this gameweek
            player_game_response = supabase.table("player_game")\
                .select("player_id, score")\
                .in_("game_id", game_ids)\
                .execute()
            
            if player_game_response.data:
                # Sum scores for players who played multiple games
                for pg in player_game_response.data:
                    pid = pg["player_id"]
                    score = pg["score"] or 0.0
                    player_scores[pid] = player_scores.get(pid, 0.0) + score
        
        # Calculate total points
        total_points = 0.0
        for player in response.data:
            if not player["is_starting"]:
                continue
            
            player_score = player_scores.get(player["player_id"], 0.0)
            multiplier = 2.0 if player["is_captain"] else 1.0
            total_points += player_score * multiplier
        
        # Get all trades for this user in this gameweek
        trade_response = supabase.table("trade")\
            .select("free", count="exact")\
            .eq("user_id", user_id)\
            .eq("gameweek", gameweek)\
            .execute()

        trades_made = trade_response.count or 0

        penalty_trades = 0
        if trade_response.data:
            penalty_trades = sum(1 for t in trade_response.data if not t["free"])

        trade_penalty = penalty_trades * 50

        
        return total_points, trades_made, trade_penalty
    
    except Exception as e:
        print(f"❌ Error calculating score for user {user_id[:8]}: {e}")
        return 0.0, 0, 0


def calculate_all_scores(gameweek: int) -> List[Dict]:
    """
    Calculate scores for all users and return list of squad_history records
    """
    try:
        # Get all unique users who have squad_history_player entries
        response = supabase.table("squad_history_player")\
            .select("user_id")\
            .eq("gameweek", gameweek)\
            .execute()
        
        if not response.data:
            print(f"⚠️  No users found with squad history for gameweek {gameweek}")
            return []
        
        user_ids = list(set(p["user_id"] for p in response.data))
        print(f"📊 Calculating scores for {len(user_ids)} users...")
        
        squad_history_records = []

        for user_id in user_ids:
            points, trades, penalty = calculate_user_score(user_id, gameweek)

            net_points = points - penalty

            squad_history_records.append({
                "user_id": user_id,
                "gameweek": gameweek,
                "gameweek_points": net_points,
                "rank": 0,
                "trades_made": trades,
                "trade_penalty": penalty,
                "created_at": datetime.now(timezone.utc).isoformat()
            })

            supabase.rpc(
                "increment_total_points",
                {
                    "p_user_id": user_id,
                    "p_delta": net_points
                }
            ).execute()
        
        # Sort by points to calculate ranks
        squad_history_records.sort(key=lambda x: x["gameweek_points"], reverse=True)
        
        for rank, record in enumerate(squad_history_records, start=1):
            record["rank"] = rank
        
        print(f"✅ Calculated scores for {len(squad_history_records)} users")
        return squad_history_records
    
    except Exception as e:
        print(f"❌ Error calculating all scores: {e}")
        return []


def insert_squad_history(records: List[Dict]) -> bool:
    """Insert squad_history records into database"""
    try:
        if not records:
            print("⚠️  No records to insert")
            return False
        
        supabase.table("squad_history")\
            .insert(records)\
            .execute()
        
        print(f"✅ Inserted {len(records)} squad_history records")
        return True
    
    except Exception as e:
        print(f"❌ Error inserting squad_history: {e}")
        return False


def calculate_weekly_scores():
    """
    Main function to calculate weekly scores
    Should run after all games are scored (e.g., Tuesday morning)
    """
    print("=" * 60)
    print("🧮 WEEKLY SCORE CALCULATION - GAMEWEEK COMPLETE")
    print("=" * 60)
    print(f"⏰ Timestamp: {datetime.now(timezone.utc).isoformat()}")
    print()
    
    # Step 1: Get the completed gameweek
    gameweek = get_completed_gameweek()
    if not gameweek:
        print("❌ Cannot proceed: No completed gameweek found")
        return False
    
    print(f"🎯 Target gameweek: {gameweek}")
    print()
    
    # Step 2: Check if already calculated
    if check_if_scores_calculated(gameweek):
        print(f"⏭️  Skipping: Gameweek {gameweek} already calculated")
        return False
    
    # Step 3: Get player activity data
    print("📥 Fetching player activity data...")
    active_players = get_player_activity(gameweek)
    
    # Step 4: Adjust inactive players (bench swaps)
    print("\n🔄 Adjusting inactive players...")
    adjustments = adjust_inactive_players(gameweek, active_players)
    print(f"   Made {adjustments} adjustments")
    
    # Step 5: Calculate all scores
    print("\n🧮 Calculating scores for all users...")
    squad_history_records = calculate_all_scores(gameweek)
    
    if not squad_history_records:
        print("❌ No scores calculated")
        return False
    
    # Step 6: Insert into squad_history
    print("\n💾 Inserting squad_history records...")
    success = insert_squad_history(squad_history_records)
    
    # Summary
    print()
    print("=" * 60)
    print("📊 CALCULATION RESULTS")
    print("=" * 60)
    print(f"Gameweek: {gameweek}")
    print(f"Users processed: {len(squad_history_records)}")
    print(f"Inactive player adjustments: {adjustments}")
    print(f"Top score: {squad_history_records[0]['gameweek_points']:.1f} points")
    print()
    
    if success:
        print(f"🎉 Scores successfully calculated for gameweek {gameweek}!")
        return True
    else:
        print("❌ Failed to insert squad_history records")
        return False


if __name__ == "__main__":
    success = calculate_weekly_scores()
    exit(0 if success else 1)
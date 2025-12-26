"""
Squad Player History Snapshot Script for Squad Champs
Records squads at the start of each gameweek by archiving squad_player data
Run via GitHub Actions every Monday morning (gameweek start)

Note: trades_made is a cumulative counter and is NOT reset by this script
"""

import os
from dotenv import load_dotenv
from datetime import datetime, timezone
from supabase import create_client, Client
from typing import Optional, Dict, List

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_KEY")  # Use service key for backend operations
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)


def get_upcoming_gameweek() -> Optional[int]:
    """
    Get the upcoming gameweek that's about to start
    Returns the gameweek number whose start_date is today or in the near future
    """
    try:
        # today = datetime.now(timezone.utc).date()
        today = datetime(2025,12,22)
        
        # Get gameweek starting today or the next upcoming one
        response = supabase.table("gameweek")\
            .select("gameweek, start_date")\
            .gte("start_date", str(today))\
            .order("start_date")\
            .limit(1)\
            .execute()
        
        if response.data:
            gameweek_data = response.data[0]
            print(f"Found upcoming gameweek: {gameweek_data['gameweek']} (starts {gameweek_data['start_date']})")
            return gameweek_data["gameweek"]
        
        print(f"No upcoming gameweek found from date: {today}")
        return None
    
    except Exception as e:
        print(f"Error fetching upcoming gameweek: {e}")
        return None


def check_if_snapshot_exists(gameweek: int) -> bool:
    """Check if snapshot already exists for this gameweek to prevent duplicates"""
    try:
        response = supabase.table("squad_history_player")\
            .select("gameweek", count="exact")\
            .eq("gameweek", gameweek)\
            .limit(1)\
            .execute()
        
        exists = response.count > 0
        if exists:
            print(f"⚠️  Snapshot already exists for gameweek {gameweek}")
        return exists
    
    except Exception as e:
        print(f"Error checking snapshot existence: {e}")
        return False


def get_all_squad_players() -> List[Dict]:
    """Fetch all current squad_player records from all users"""
    try:
        response = supabase.table("squad_player")\
            .select("*")\
            .execute()
        
        squad_players = response.data
        print(f"📊 Found {len(squad_players)} squad player records across all users")
        return squad_players
    
    except Exception as e:
        print(f"❌ Error fetching squad players: {e}")
        return []


def transform_to_history_records(squad_players: List[Dict], gameweek: int) -> List[Dict]:
    """
    Transform squad_player records into squad_history_player format
    Excludes purchase_price as it's not part of the history table
    """
    history_records = []
    
    for sp in squad_players:
        history_records.append({
            "player_id": sp["player_id"],
            "user_id": sp["user_id"],
            "gameweek": gameweek,
            "is_starting": sp["is_starting"],
            "bench_order": sp["bench_order"],
            "is_captain": sp["is_captain"],
            "is_vice_captain": sp["is_vice_captain"],
            "created_at": datetime.now(timezone.utc).isoformat()
        })
    
    return history_records


def batch_insert_history(history_records: List[Dict], chunk_size: int = 500) -> Dict:
    """
    Insert history records in batches to avoid payload size limits
    Returns success/error statistics
    """
    results = {
        "success_count": 0,
        "error_count": 0,
        "errors": []
    }
    
    total_batches = (len(history_records) + chunk_size - 1) // chunk_size
    
    for i in range(0, len(history_records), chunk_size):
        chunk = history_records[i:i + chunk_size]
        batch_num = i // chunk_size + 1
        
        try:
            supabase.table("squad_history_player")\
                .insert(chunk)\
                .execute()
            
            results["success_count"] += len(chunk)
            print(f"✅ Batch {batch_num}/{total_batches}: Inserted {len(chunk)} records")
        
        except Exception as e:
            error_msg = f"Batch {batch_num}/{total_batches} failed: {str(e)}"
            print(f"❌ {error_msg}")
            results["error_count"] += len(chunk)
            results["errors"].append(error_msg)
    
    return results


def record_squads_for_gameweek():
    """
    Main function to record all squads at gameweek start
    Creates immutable snapshot in squad_history_player
    """
    print("=" * 60)
    print("📸 SQUAD SNAPSHOT PROCESS - GAMEWEEK START")
    print("=" * 60)
    print(f"⏰ Timestamp: {datetime.now(timezone.utc).isoformat()}")
    print()
    
    # Step 1: Determine which gameweek is starting
    gameweek = get_upcoming_gameweek()
    if not gameweek:
        print("❌ Cannot proceed: No upcoming gameweek found")
        print("   Check that gameweek table has future entries")
        return False
    
    print(f"🎯 Target gameweek: {gameweek}")
    print()
    
    # Step 2: Check for existing snapshot (prevent duplicates)
    if check_if_snapshot_exists(gameweek):
        print(f"⏭️  Skipping: Gameweek {gameweek} already recorded")
        print("   This prevents duplicate snapshots")
        return False
    
    # Step 3: Fetch all current squad_player data
    print("📥 Fetching current squad data...")
    squad_players = get_all_squad_players()
    
    if not squad_players:
        print("⚠️  Warning: No squad players found to snapshot")
        print("   This might be normal if no users have created squads yet")
        return False
    
    # Step 4: Transform data for history table
    print(f"🔄 Transforming {len(squad_players)} records for archival...")
    history_records = transform_to_history_records(squad_players, gameweek)
    
    # Step 5: Batch insert into squad_history_player
    print(f"💾 Inserting into squad_history_player...")
    results = batch_insert_history(history_records)
    
    # Step 6: Report results
    print()
    print("=" * 60)
    print("📊 SNAPSHOT RESULTS")
    print("=" * 60)
    print(f"✅ Successfully recorded: {results['success_count']} player records")
    print(f"❌ Failed: {results['error_count']} player records")
    
    if results["errors"]:
        print("\n⚠️  ERRORS ENCOUNTERED:")
        for error in results["errors"]:
            print(f"   • {error}")
        return False
    else:
        print(f"\n🎉 All squads successfully recorded for gameweek {gameweek}!")
        print("   Historical snapshot created")
        return True


if __name__ == "__main__":
    success = record_squads_for_gameweek()
    exit(0 if success else 1)
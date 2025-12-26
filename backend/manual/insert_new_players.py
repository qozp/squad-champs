import os
from dotenv import load_dotenv
from supabase import create_client
from nba_api.stats.endpoints import playergamelog
from backend.scripts.init_players import get_player_details
from backend.scripts.fetch_box import get_new_players, remove_new_player, calculate_score

load_dotenv()

def backfill_player_games(supabase, player_id):
    """Retroactively fetch all player_games for a player for the current season."""
    try:
        print(f"  Fetching game log for player {player_id}...")
        player_log = playergamelog.PlayerGameLog(player_id)
        data = player_log.get_dict()
        
        games = data['resultSets'][0]['rowSet']
        
        if not games:
            print(f"  No games found for player {player_id}")
            return
        
        print(f"  Found {len(games)} games to backfill")
        
        player_games = []
        for game in games:
            game_id = int(game[2])  # Game_ID
            minutes = game[6] if game[6] else 0  # MIN
            
            if minutes == 0:
                continue
            
            player_game = {
                "player_id": player_id,
                "game_id": game_id,
                "points": int(game[24] or 0),  # PTS
                "rebounds": int(game[18] or 0),  # REB
                "assists": int(game[19] or 0),  # AST
                "steals": int(game[20] or 0),  # STL
                "blocks": int(game[21] or 0),  # BLK
                "turnovers": int(game[22] or 0),  # TOV
                "3pm": int(game[10] or 0),  # FG3M
                "3pa": int(game[11] or 0),  # FG3A
                "fgm": int(game[7] or 0),  # FGM
                "fga": int(game[8] or 0),  # FGA
                "ftm": int(game[13] or 0),  # FTM
                "fta": int(game[14] or 0),  # FTA
                "minutes": int(minutes),
            }
            
            player_game["score"] = calculate_score(player_game)
            player_games.append(player_game)
        
        if player_games:
            supabase.table("player_game").upsert(player_games).execute()
            print(f"  ✅ Backfilled {len(player_games)} games for player {player_id}")
        else:
            print(f"  No games with minutes played for player {player_id}")
            
    except Exception as e:
        print(f"  ❌ Error backfilling player {player_id}: {e}")
        raise  # Re-raise so we don't remove from new_player table

def process_new_players():
    """Fetch and insert all players from the new players table."""
    supabase = create_client(
        os.getenv("SUPABASE_URL"),
        os.getenv("SUPABASE_SERVICE_KEY")
    )
    
    new_players = get_new_players(supabase)
    
    if not new_players:
        print("✅ No new players to process!")
        return
    
    print(f"Found {len(new_players)} new players to process...")
    
    success_count = 0
    
    for player_id in new_players:
        try:
            print(f"\nFetching player {player_id}...")
            details = get_player_details(player_id)
            
            if not details:
                print(f"  ❌ Still failed to fetch player {player_id}")
                continue
            
            details["price"] = 4.0
            supabase.table("player").upsert(details).execute()
            
            print(f"  ✅ Successfully inserted player {player_id}")
            
            backfill_player_games(supabase, player_id)
            
            # Only remove after both player insert AND backfill succeed
            remove_new_player(supabase, player_id)
            success_count += 1
            
        except Exception as e:
            print(f"  ❌ Error processing player {player_id}: {e}")
            # Don't remove from new_player so it can be retried later
    
    print(f"\n📊 Successfully processed: {success_count}/{len(new_players)}")

if __name__ == "__main__":
    process_new_players()
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
        
        headers = data['resultSets'][0]['headers']
        rows = data['resultSets'][0]['rowSet']
        
        if not rows:
            print(f"  No games found for player {player_id}")
            return
        
        print(f"  Found {len(rows)} games to backfill")
        
        player_games = []
        for row in rows:
            game = dict(zip(headers, row))
            
            minutes = game.get('MIN') if game.get('MIN') else 0
            
            if minutes == 0:
                continue
            
            player_game = {
                "player_id": player_id,
                "game_id": int(game.get('Game_ID')),
                "points": int(game.get('PTS') or 0),
                "rebounds": int(game.get('REB') or 0),
                "assists": int(game.get('AST') or 0),
                "steals": int(game.get('STL') or 0),
                "blocks": int(game.get('BLK') or 0),
                "turnovers": int(game.get('TOV') or 0),
                "3pm": int(game.get('FG3M') or 0),
                "3pa": int(game.get('FG3A') or 0),
                "fgm": int(game.get('FGM') or 0),
                "fga": int(game.get('FGA') or 0),
                "ftm": int(game.get('FTM') or 0),
                "fta": int(game.get('FTA') or 0),
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
        raise

def process_new_players():
    """Fetch and insert all players from the new players table."""
    supabase = create_client(
        os.getenv("SUPABASE_URL"),
        os.getenv("SUPABASE_SERVICE_KEY")
    )

    # new_players = [1630679]
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
            details["current_price"] = 4.0
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
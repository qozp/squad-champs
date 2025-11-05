import csv
import time
from dotenv import load_dotenv
from nba_api.stats.static import players
from nba_api.stats.endpoints import commonplayerinfo
from supabase import create_client
import os

load_dotenv()

# -----------------------------
# Helper functions
# -----------------------------

def get_all_active_players(limit=None):
    """Get list of all active players, optionally limit count"""
    all_players = players.get_active_players()
    return all_players[:limit] if limit else all_players

def get_player_details(player_id):
    """Fetch detailed player info using nba_api"""
    try:
        info = commonplayerinfo.CommonPlayerInfo(player_id=player_id)
        data = info.get_normalized_dict()["CommonPlayerInfo"][0]

        # Get position and trim to first part if it has a dash
        position = data.get("POSITION") or "Unknown"
        if position and "-" in position:
            position = position.split("-")[0].strip()

        return {
            "id": data.get("PERSON_ID"),
            "first_name": data.get("FIRST_NAME"),
            "last_name": data.get("LAST_NAME"),
            "position": position,
            "team_id": data.get("TEAM_ID") or None,
            "height_in": parse_height(data.get("HEIGHT")),
            "weight_lb": parse_weight(data.get("WEIGHT")),
            "birthdate": data.get("BIRTHDATE", None),
        }

    except Exception as e:
        print(f"Error fetching player {player_id}: {e}")
        return None

def parse_height(height_str):
    """Convert height from '6-8' format to inches"""
    if not height_str or "-" not in height_str:
        return None
    feet, inches = height_str.split("-")
    return int(feet) * 12 + int(inches)

def parse_weight(weight_str):
    """Convert weight string to int"""
    try:
        return int(weight_str)
    except:
        return None
    
def print_player_info(player_id=2544):
    info = commonplayerinfo.CommonPlayerInfo(player_id=player_id)
    data = info.get_normalized_dict()

    print("\n--- Available Keys ---")
    for k, v in data.items():
        print(f"{k}: {list(v[0].keys()) if v else '[]'}")

    print("\n--- Sample Data ---")
    for k, v in data.items():
        print(f"\n{k}:")
        print(v[0] if v else "[]")

# -----------------------------
# Main
# -----------------------------
def main():
    # print_player_info()
    # return

    supabase = create_client(os.getenv("SUPABASE_URL"), os.getenv("SUPABASE_SERVICE_KEY"))

    # Fetch from supabase
    existing_data = supabase.table("player").select("id").execute()
    existing_ids = {p["id"] for p in existing_data.data} if existing_data.data else set()
    print(f"Found {len(existing_ids)} existing players in Supabase")

    # Get from nba_api
    active_players = get_all_active_players()
    print(f"Found {len(active_players)} active NBA players")

    # Find mis-match
    new_players = [p for p in active_players if p["id"] not in existing_ids]
    print(f"Found {len(new_players)} new players to insert")

    if not new_players:
        print("No new players to add, exiting.")
        return
    
    player_records = []
    for i, p in enumerate(new_players, 1):
        details = get_player_details(p["id"])
        if details:
            player_records.append(details)
        print(f"[{i}/{len(new_players)}] Fetched: {details['id'] if details else 'Error'}")
        time.sleep(0.6)

    if player_records:
        print(f"Inserting {len(player_records)} new players into Supabase.")
        supabase.table("player").insert(player_records).execute()
        print("New players insert successfully.")
    else:
        print("No valid player details to insert.")

if __name__ == "__main__":
    main()

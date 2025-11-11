import os
import csv
from datetime import datetime
import time
from math import ceil
from dotenv import load_dotenv
from supabase import create_client
from nba_api.stats.endpoints import playercareerstats

# Reuse your fantasy scoring
from fetch_box import calculate_score
from batching import insert_in_batches

load_dotenv()

TEST_DATA_DIR = "test_data"
os.makedirs(TEST_DATA_DIR, exist_ok=True)

# -----------------------------
# Setup
# -----------------------------

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_SERVICE_KEY = os.getenv("SUPABASE_SERVICE_KEY")
supabase = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)

# -----------------------------
# Helpers
# -----------------------------

def fetch_player_career_stats(player_id):
    """
    Fetch all season-by-season averages for a player using nba_api.
    Returns a list of dicts with fields matching player_history schema.
    """
    try:
        career = playercareerstats.PlayerCareerStats(player_id=player_id)
        data = career.get_data_frames()[0]  # returns pandas DataFrame
        return data.to_dict("records")
    except Exception as e:
        print(f"Error fetching career stats for player {player_id}: {e}")
        return []


def transform_to_history_rows(player_id, stats_records):
    """
    Convert nba_api career data to your player_history schema format.
    """
    player_history_rows = []

    for row in stats_records:
        # Skip blank seasons
        if not row.get("SEASON_ID"):
            continue

        try:
            season_id = row["SEASON_ID"]
            team_id = int(row["TEAM_ID"])
        except ValueError:
            continue

        # Extract per-game averages or totals
        points = int(row.get("PTS", 0))
        rebounds = int(row.get("REB", 0))
        assists = int(row.get("AST", 0))
        steals = int(row.get("STL", 0))
        blocks = int(row.get("BLK", 0))
        turnovers = int(row.get("TOV", 0))
        threes_made = int(row.get("FG3M", 0))
        threes_att = int(row.get("FG3A", 0))
        fgm = int(row.get("FGM", 0))
        fga = int(row.get("FGA", 0))
        ftm = int(row.get("FTM", 0))
        fta = int(row.get("FTA", 0))
        minutes = int(row.get("MIN", 0)) if not isinstance(row.get("MIN"), str) else 0
        gp = int(row.get("GP", 0))
        gs = int(row.get("GS", 0))

        stats = {
            "points": points,
            "rebounds": rebounds,
            "assists": assists,
            "steals": steals,
            "blocks": blocks,
            "turnovers": turnovers,
            "3pm": threes_made,
            "3pa": threes_att,
            "fgm": fgm,
            "fga": fga,
            "ftm": ftm,
            "fta": fta,
        }

        score = calculate_score(stats)

        player_history_rows.append({
            "player_id": player_id,
            "season_id": season_id,
            "team_id": team_id,
            "points": points,
            "rebounds": rebounds,
            "assists": assists,
            "steals": steals,
            "blocks": blocks,
            "turnovers": turnovers,
            "3pm": threes_made,
            "3pa": threes_att,
            "fgm": fgm,
            "fga": fga,
            "ftm": ftm,
            "fta": fta,
            "score": score,
            "minutes": minutes,
            "gp": gp,
            "gs": gs
        })

    return player_history_rows


def write_to_csv(rows, output_path):
    """
    Write all player history rows to a CSV for validation.
    """
    if not rows:
        print("⚠️ No rows to write.")
        return

    fieldnames = list(rows[0].keys())
    with open(output_path, "w", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(rows)

    print(f"✅ Wrote {len(rows)} rows to {output_path}")

# -----------------------------
# Main
# -----------------------------

def main():
    # Get all player IDs from Supabase
    print("Fetching players from Supabase...")
    resp = supabase.table("player").select("id").execute()
    players = [p["id"] for p in resp.data]
    print(f"Found {len(players)} players.")

    return

    print("Fetching player history from NBA_API...")
    BATCH_SIZE = 50
    REQUEST_DELAY = 0.6  # Seconds between player requests in a batch

    # === Set which batches to run ===
    # batch_start = 0  # Uncomment this for a full run
    # batch_start = 12     # batch index 12 = batch 13 (0-based)
    total_batches = ceil(len(players) / BATCH_SIZE)

    for batch_num in range(batch_start, total_batches):
        start = batch_num * BATCH_SIZE
        end = start + BATCH_SIZE
        batch = players[start:end]
        print(f"\n=== Processing batch {batch_num + 1}/{total_batches} ({len(batch)} players) ===")
        batch_rows = []

        for i, player_id in enumerate(batch, start=1):
            print(f"  [{i}/{len(batch)}] Fetching history for player {player_id}...")
            career_stats = fetch_player_career_stats(player_id)
            rows = transform_to_history_rows(player_id, career_stats)
            batch_rows.extend(rows)
            time.sleep(REQUEST_DELAY)

        print(f"✅ Finished batch {batch_num + 1}/{total_batches}")

        # Insert all rows from this batch at once
        if batch_rows:
            print(f"🚀 Inserting {len(batch_rows)} rows from batch {batch_num + 1} into Supabase...")
            supabase.table("player_history").insert(batch_rows).execute()
            print(f"✅ Batch {batch_num + 1} inserted successfully.")
        else:
            print(f"⚠️ No rows to insert for batch {batch_num + 1}")

    # Write to CSV for inspection
    # csv_path = os.path.join(TEST_DATA_DIR, "player_history_test.csv")
    # write_to_csv(all_rows, csv_path)


if __name__ == "__main__":
    main()

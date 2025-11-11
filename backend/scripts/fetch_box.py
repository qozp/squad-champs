import csv
import json

import os
from datetime import datetime, date, timedelta
import re
from dotenv import load_dotenv
from supabase import create_client
from nba_api.stats.endpoints import scoreboardv2
from nba_api.live.nba.endpoints import scoreboard, boxscore

from init_players import get_player_details
from logger_config import daily_job_logger

load_dotenv()

# -----------------------------
# Helper Functions
# -----------------------------

def get_gameweek_for_date(supabase, target_date):
    """Return the gameweek number that target_date falls into."""
    resp = supabase.table("gameweek").select("gameweek, start_date, end_date").execute()
    for gw in resp.data:
        start = datetime.strptime(gw["start_date"], "%Y-%m-%d").date()
        end = datetime.strptime(gw["end_date"], "%Y-%m-%d").date()
        if start <= target_date <= end:
            return gw["gameweek"]
    return 1


def get_game_ids_for_date(target_date):
    """
    Fetch all NBA games for a given date using nba_api.
    Returns a list of dicts: { home_team, away_team, home_score, away_score, date }
    """
    try:
        scoreboard = scoreboardv2.ScoreboardV2(game_date=target_date.strftime("%Y-%m-%d"), league_id="00")
        data = scoreboard.get_normalized_dict()["Available"]
        game_ids = [g.get("GAME_ID") for g in data]

        return game_ids
    
    except Exception as e:
        print(f"Error fetching games for {target_date}: {e}")
        return []
    
def get_game_for_game_id(game_id):
    try:
        box = boxscore.BoxScore(game_id=game_id)
        return box.game.get_dict()
    
    except Exception as e:
        print(f"Error fetching box scores for {game_id}: {e}")
        return []
    
def get_game_details_for_game(game, gameweek):
    return {
        "id": game.get("gameId"),
        "home_team_id": game.get("homeTeam").get("teamId"),
        "away_team_id": game.get("awayTeam").get("teamId"),
        "home_score": game.get("homeTeam").get("score"),
        "away_score": game.get("awayTeam").get("score"),
        "gameweek": gameweek,
        "date": game.get("gameTimeUTC")
    }

def calculate_score(stats):
    """
    Given a player's stats dict (points, rebounds, assists, etc.),
    calculate bonus points (bps) and fantasy score.
    """

    points = stats.get("points", 0)
    rebounds = stats.get("rebounds", 0)
    assists = stats.get("assists", 0)
    steals = stats.get("steals", 0)
    blocks = stats.get("blocks", 0)
    turnovers = stats.get("turnovers", 0)
    fgm = stats.get("fgm", 0)
    fga = stats.get("fga", 0)
    ftm = stats.get("ftm", 0)
    fta = stats.get("fta", 0)
    threes = stats.get("3pm", 0)

    # Example fantasy scoring (customize as needed)
    score = (
        points * 1
        + rebounds * 1.2
        + assists * 1.5
        + steals * 3
        + blocks * 3
        - turnovers * 2
        + fgm * 1
        - fga * 0.5
        + ftm * 1
        - fta * 0.75
        + threes * 1
    )

    return round(score, 1)


def get_player_details_for_game(game, supabase):
    
    player_stats = []

    home_team_id = int(game.get("homeTeam", {}).get("teamId"))
    away_team_id = int(game.get("awayTeam", {}).get("teamId"))

    # Combine both teams’ player lists
    home_players = game.get("homeTeam", {}).get("players", [])
    away_players = game.get("awayTeam", {}).get("players", [])

    existing_data = supabase.table("player").select("id, team_id").execute()
    existing_info = {p["id"]: p.get("team_id") for p in existing_data.data} if existing_data.data else {}

    def process_team_players(players, team_id):
        for p in players:
            player_id = int(p.get("personId"))

            # -----------------------------
            # update team if changed
            # -----------------------------
            current_team = existing_info.get(player_id)
            if current_team and current_team != team_id:
                print(f"🔁 Updating team for player {player_id}: {existing_info[player_id]} → {team_id}")
                supabase.table("player").update({"team_id": team_id}).eq("id", player_id).execute()
                existing_info[player_id] = team_id

            if player_id not in existing_info:
                details = get_player_details(player_id)  # Your helper from the other file
                if details:
                    supabase.table("player").insert(details).execute()
                    existing_info[player_id] = team_id
                    print(f"Inserted new player {player_id} into Supabase")
                else:
                    print(f"Failed to fetch details for player {player_id}")
                    continue

            stats = p.get("statistics", {})

            minutes_str = stats.get("minutesCalculated") or stats.get("minutes")
            minutes = 0
            if isinstance(minutes_str, str):
                match = re.search(r"PT(\d+)M", minutes_str)
                if match:
                    minutes = int(match.group(1))

            # Skip players who did not play
            if minutes == 0:
                continue

            player_dict = {
                "player_id": player_id,
                "game_id": int(game.get("gameId")),
                "points": int(stats.get("points", 0)),
                "rebounds": int(stats.get("reboundsTotal", 0)),
                "assists": int(stats.get("assists", 0)),
                "steals": int(stats.get("steals", 0)),
                "blocks": int(stats.get("blocks", 0)),
                "turnovers": int(stats.get("turnovers", 0)),
                "3pm": int(stats.get("threePointersMade", 0)),
                "3pa": int(stats.get("threePointersAttempted", 0)),
                "fgm": int(stats.get("fieldGoalsMade", 0)),
                "fga": int(stats.get("fieldGoalsAttempted", 0)),
                "ftm": int(stats.get("freeThrowsMade", 0)),
                "fta": int(stats.get("freeThrowsAttempted", 0)),
                "minutes": minutes,
            }

            score = calculate_score(player_dict)
            player_dict["score"] = score
            player_stats.append(player_dict)

    process_team_players(home_players, home_team_id)
    process_team_players(away_players, away_team_id)

    return player_stats

# -----------------------------
# Main
# -----------------------------

def main_for_date(target_date, supabase):
    print(f"Fetching games for {target_date}...")

    # Determine which gameweek this date belongs to
    gameweek = get_gameweek_for_date(supabase, target_date)
    if not gameweek:
        print(f"No gameweek found for {target_date}. Exiting.")
        return

    # Get games from nba_api
    game_ids = get_game_ids_for_date(target_date)
    print(f"Found game_ids: {game_ids} on {target_date}.")

    game_details = []
    player_games = []

    for i in game_ids:
        game = get_game_for_game_id(i)
        game_details.append(get_game_details_for_game(game, gameweek))
        player_games.append(get_player_details_for_game(game, supabase))

    if game_details:
        # Insert games into Supabase
        print(f"Inserting {len(game_details)} games into Supabase...")
        supabase.table("game").insert(game_details).execute()
        print("✅ Games inserted successfully.")
    else:
        print("No games or player_games to insert.")
        return
    
    all_player_games = [p for game in player_games for p in game]
    print(f"Inserting {len(all_player_games)} player_games into Supabase...")

    # Now insert
    if all_player_games:
        supabase.table("player_game").insert(all_player_games).execute()
        print("✅ Player Games inserted successfully.")

if __name__ == "__main__":
    supabase = create_client(os.getenv("SUPABASE_URL"), os.getenv("SUPABASE_SERVICE_KEY"))

    day = date.today() - timedelta(days=1) # set to yesterday
    
    try:
        print("Running daily job for %s...", day)
        daily_job_logger.info("Starting daily job for %s", day)
        main_for_date(day, supabase)
        daily_job_logger.info("✅ Successfully completed job for  %s", day)

    except Exception as e:
        daily_job_logger.error("❌ Error running job for  %s: %s", day, e)
        print(f"Error: {e}")

    # start_date = datetime.strptime("2025-11-06", "%Y-%m-%d").date()
    # end_date = datetime.strptime("2025-11-09", "%Y-%m-%d").date()

    # delta = timedelta(days=1)
    # current_date = start_date

    # while current_date <= end_date:
    #     main_for_date(current_date, supabase)
    #     current_date += delta
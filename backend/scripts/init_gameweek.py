import time
from datetime import date, timedelta
from dotenv import load_dotenv
from supabase import create_client
import os

load_dotenv()

START_DATE = date(2025, 10, 20)  # Season start
END_DATE = date(2026, 4, 12)     # Regular season end

# -----------------------------
# Helper functions
# -----------------------------

def generate_gameweeks(start_date, end_date):
    """
    Generate gameweeks between start_date and end_date.
    Each week runs Monday → Sunday, except the last week ends at end_date.
    """
    # Align start_date to the first Monday on or after start_date
    current = start_date
    if current.weekday() != 0:  # 0 = Monday
        current += timedelta(days=(7 - current.weekday()))

    gameweeks = []
    gw_num = 1

    while current <= end_date:
        week_start = current
        week_end = week_start + timedelta(days=6)
        if week_end > end_date:
            week_end = end_date

        gameweeks.append({
            "gameweek": gw_num,
            "start_date": str(week_start),
            "end_date": str(week_end),
        })

        gw_num += 1
        current = week_start + timedelta(days=7)

    return gameweeks


# -----------------------------
# Main
# -----------------------------
def main():
    # Create Supabase client
    supabase = create_client(os.getenv("SUPABASE_URL"), os.getenv("SUPABASE_SERVICE_KEY"))

    # Generate gameweeks
    gameweeks = generate_gameweeks(START_DATE, END_DATE)
    print(f"Generated {len(gameweeks)} gameweeks.")
    for gw in gameweeks:
        print(f"Gameweek {gw['gameweek']}: {gw['start_date']} → {gw['end_date']}")

    # Check existing entries
    existing = supabase.table("gameweek").select("gameweek").execute()
    existing_gws = {row["gameweek"] for row in existing.data} if existing.data else set()
    print(f"\nFound {len(existing_gws)} existing gameweeks in Supabase.")

    # Filter new ones
    new_gameweeks = [gw for gw in gameweeks if gw["gameweek"] not in existing_gws]

    if not new_gameweeks:
        print("No new gameweeks to add. Exiting.")
        return

    print(f"Inserting {len(new_gameweeks)} new gameweeks...")
    supabase.table("gameweek").insert(new_gameweeks).execute()
    print("✅ Gameweeks inserted successfully.")


if __name__ == "__main__":
    main()

import csv
from dotenv import load_dotenv
from nba_api.stats.static import teams
from supabase import create_client
import os

load_dotenv()

def get_all_teams():
    """Get all NBA teams (active only)."""
    all_teams = teams.get_teams()
    # Optional: only keep active teams
    # return [t for t in all_teams if t["is_active"]]
    return all_teams

def main():
    team_records = get_all_teams()
    print(f"Found {len(team_records)} active teams")

    # Normalize fields to match your simplified team table
    normalized = []
    for t in team_records:
        normalized.append({
            "id": t.get("id"),
            "team_name": t.get("full_name"),
            "team_abbreviation": t.get("abbreviation"),
            "team_city": t.get("city"),
        })

    # # -----------------------------
    # # Write CSV for manual review
    # # -----------------------------
    # csv_file = "team_data.csv"
    # with open(csv_file, mode="w", newline="", encoding="utf-8") as f:
    #     writer = csv.DictWriter(f, fieldnames=normalized[0].keys())
    #     writer.writeheader()
    #     writer.writerows(normalized)

    # print(f"\n✅ CSV written to {csv_file}. Review before inserting into Supabase.")

    # -----------------------------
    # Supabase insert (commented out)
    # -----------------------------
    supabase = create_client(os.getenv("SUPABASE_URL"), os.getenv("SUPABASE_SERVICE_KEY"))
    for record in normalized:
        supabase.table("team").insert(record).execute()
    print("Team data inserted into Supabase")

if __name__ == "__main__":
    main()

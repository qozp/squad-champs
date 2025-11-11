import json
from nba_api.stats.endpoints import playercareerstats

# Example player_id — Stephen Curry (201939)
PLAYER_ID = 201939

def main():
    career = playercareerstats.PlayerCareerStats(player_id=PLAYER_ID)
    data = career.get_dict()  # raw JSON-like structure straight from the API

    # Save to file for manual inspection
    with open("test_data/player_career_raw.json", "w") as f:
        json.dump(data, f, indent=2)
    print("\n✅ Saved output to test_data/player_career_raw.json")

if __name__ == "__main__":
    main()

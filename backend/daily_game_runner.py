from scripts.fetch_box import insert_todays_pending_games, process_pending_games
from supabase import create_client
import os

def main():
    supabase = create_client(os.getenv("SUPABASE_URL"), os.getenv("SUPABASE_SERVICE_KEY"))
    # process_pending_games(supabase)
    insert_todays_pending_games(supabase)
    
if __name__ == "__main__":
    main()

from datetime import datetime
from supabase import create_client
from dotenv import load_dotenv
import os

load_dotenv()

def init_current_price(supabase, batch_size: int = 100):
    """
    Copy `price` to `current_price` for all players in Supabase,
    updating manually without using an RPC.
    """
    now = datetime.now().isoformat()

    # Fetch only id and price
    response = supabase.table("player").select("id, price").execute()
    players = response.data

    if not players:
        print("No players found to update.")
        return

    # Update in batches
    total_updated = 0
    for i in range(0, len(players), batch_size):
        chunk = players[i : i + batch_size]
        for p in chunk:
            supabase.table("player").update({
                "current_price": p.get("price") if p.get("price") is not None else 4.5,
                "updated_at": now
            }).eq("id", p["id"]).execute()
            total_updated += 1

        print(f"Batch {i // batch_size + 1} synced {len(chunk)} players.")

    print(f"✅ Synced current_price for {total_updated} players.")

def main():
    supabase = create_client(os.getenv("SUPABASE_URL"), os.getenv("SUPABASE_SERVICE_KEY"))
    init_current_price(supabase)


if __name__ == "__main__":
    main()

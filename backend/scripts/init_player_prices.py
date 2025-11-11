from datetime import datetime
import pandas as pd
import numpy as np
import os
from dotenv import load_dotenv
from supabase import create_client

load_dotenv()

TOTAL_BUDGET = 100
SQUAD_SIZE = 13
AVG_BUDGET_PER_PLAYER = TOTAL_BUDGET / SQUAD_SIZE  # ~7.7 avg
MIN_PRICE = 4.0
MAX_PRICE_GUIDE = 12.0
PRICE_STEP = 0.5

def round_to_half(x):
    return round(x * 2) / 2

def fetch_player_averages_from_db():
    """Fetch player averages and games played using Supabase function."""
    supabase = create_client(os.getenv("SUPABASE_URL"), os.getenv("SUPABASE_SERVICE_KEY"))
    response = supabase.rpc("get_player_averages").execute()
    data = response.data
    if not data:
        raise ValueError("No player average data returned from Supabase.")
    return pd.DataFrame(data)

def calculate_prices(df: pd.DataFrame) -> pd.DataFrame:
    """Calculate normalized player prices from fantasy stats."""

    numeric_cols = [
        "avg_pts",
        "avg_reb",
        "avg_ast",
        "avg_stl",
        "avg_blk",
        "avg_fp",
        "games_played",
        "avg_minutes",
    ]
    for col in numeric_cols:
        if col not in df.columns:
            df[col] = 0
    df[numeric_cols] = df[numeric_cols].apply(pd.to_numeric, errors="coerce").fillna(0)

    # Weighted fantasy performance
    games_weight = np.minimum(df["games_played"] / 10, 1.0)
    minutes_weight = df["avg_minutes"] / df["avg_minutes"].max()
    df["weighted_fp"] = df["avg_fp"] * (0.1 * games_weight + 0.1 * minutes_weight)

    # Normalize weighted scores
    min_fp, max_fp = df["weighted_fp"].min(), df["weighted_fp"].max()
    df["perf_norm"] = (df["weighted_fp"] - min_fp) / (max_fp - min_fp)

    # Map to price range
    df["raw_price"] = MIN_PRICE + df["perf_norm"] * (MAX_PRICE_GUIDE - MIN_PRICE)
    df["price"] = df["raw_price"].apply(round_to_half)

    # Rescale to match target average price
    avg_price = df["price"].mean()
    scaling_factor = AVG_BUDGET_PER_PLAYER / avg_price
    df["price"] = (df["price"] * scaling_factor).apply(round_to_half)

    # Ensure min price matches exactly
    df["price"] = df["price"] - (df["price"].min() - MIN_PRICE)
    df["price"] = df["price"].clip(lower=MIN_PRICE)

    return df.sort_values("price", ascending=False)


def update_player_prices(df: pd.DataFrame, supabase, batch_size=100,):
    """Update player prices (and updated_at) in Supabase."""
    now = datetime.now().isoformat()

    updates = [
        {"id": int(row["player_id"]), "price": float(row["price"]), "updated_at": now}
        for _, row in df.iterrows()
    ]

    for i in range(0, len(updates), batch_size):
        chunk = updates[i : i + batch_size]
        supabase.rpc("update_player_prices", {"price_updates": chunk}).execute()

        print(f"Batch {i // batch_size + 1} sent with {len(chunk)} items")

def main():
    supabase = create_client(os.getenv("SUPABASE_URL"), os.getenv("SUPABASE_SERVICE_KEY"))

    print("📊 Fetching player averages...")
    df = fetch_player_averages_from_db()

    print("⚙️ Calculating prices...")
    priced_df = calculate_prices(df)

    print("⬆️ Updating Supabase player prices...")
    update_player_prices(priced_df, supabase)

    print(
        f"Average price: {priced_df['price'].mean():.2f}, "
        f"Range: {priced_df['price'].min()}–{priced_df['price'].max()}"
    )

if __name__ == "__main__":
    main()

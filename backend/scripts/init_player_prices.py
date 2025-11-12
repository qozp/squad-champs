from datetime import date, datetime
import pandas as pd
import numpy as np
import os
import math
from dotenv import load_dotenv
from supabase import create_client

from logger_config import price_job_logger
from fetch_box import calculate_score
from plot_player_price import plot_price_distribution

load_dotenv()

NBA_SEASON_START = date(2025, 10, 1)

LAST_SEASON_ID = "2024-25"
TOTAL_BUDGET = 100
SQUAD_SIZE = 13
AVG_BUDGET_PER_PLAYER = 5.87  # ~7.7 avg
MIN_PRICE = 4.0
TOP_PLAYER_SCALING_FACTOR = 1.1 # exponent
PRICE_STEP = 0.5

def round_to_half(x):
    if pd.isna(x):
        return 0
    return round(x * 2) / 2

def fetch_player_birthdates(supabase):
    """Fetch player IDs and birthdates from Supabase."""
    response = supabase.table("player").select("id, birthdate").execute()
    data = response.data
    if not data:
        raise ValueError("No player birthdates returned from Supabase.")
    df = pd.DataFrame(data)

    # Compute age as of start of season
    def calculate_age(birthdate_str):
        if not birthdate_str:
            return None
        bdate = datetime.strptime(birthdate_str, "%Y-%m-%d").date()
        return (
            NBA_SEASON_START.year
            - bdate.year
            - ((NBA_SEASON_START.month, NBA_SEASON_START.day) < (bdate.month, bdate.day))
        )

    df["age"] = df["birthdate"].apply(calculate_age)
    return df[["id", "age"]].rename(columns={"id": "player_id"})

def fetch_player_averages_from_db(supabase):
    """Fetch player averages and games played using Supabase function."""
    supabase = create_client(os.getenv("SUPABASE_URL"), os.getenv("SUPABASE_SERVICE_KEY"))
    response = supabase.rpc("get_player_averages").execute()
    data = response.data
    if not data:
        raise ValueError("No player average data returned from Supabase.")
    return pd.DataFrame(data)

def fetch_player_history_averages(supabase, season_id: str = LAST_SEASON_ID):
    """
    Fetch player averages from player_history table for the given season.
    Assumes Supabase has an RPC or direct select that aggregates per player.
    """
    response = (
        supabase.table("player_history")
        .select(
            "player_id, team_id, season_id, points, rebounds, assists, steals, blocks, turnovers, 3pm, fgm, fga, ftm, fta, score, minutes, gp"
        )
        .eq("season_id", season_id)
        .execute()
    )
    data = response.data
    if not data:
        raise ValueError(f"No player history found for season {season_id}.")
    df = pd.DataFrame(data)

    # compute fantasy score if missing
    if "score" not in df.columns or df["score"].isna().any():
        df["score"] = df.apply(lambda row: calculate_score(row.to_dict()), axis=1)

    # aggregate to per-player averages
    grouped = (
        df.groupby("player_id")
        .agg(
            avg_fp=("score", "mean"),
            avg_pts=("points", "mean"),
            avg_reb=("rebounds", "mean"),
            avg_ast=("assists", "mean"),
            avg_stl=("steals", "mean"),
            avg_blk=("blocks", "mean"),
            avg_minutes=("minutes", "mean"),
            games_played=("gp", "max"),
        )
        .reset_index()
    )
    return grouped

def compute_weighted_fantasy(df: pd.DataFrame, age_col: str = "age") -> pd.DataFrame:
    """
    Combine fantasy score, minutes, games played, and age into one weighted metric.
    """
    numeric_cols = [
        "avg_fp",
        "avg_minutes",
        "games_played",
    ]
    for col in numeric_cols:
        if col not in df.columns:
            df[col] = 0
    df[numeric_cols] = df[numeric_cols].apply(pd.to_numeric, errors="coerce").fillna(0)

    # --- weights ---
    games_weight = np.minimum(df["games_played"] / 10, 1.0)
    minutes_weight = df["avg_minutes"] / (df["avg_minutes"].max() or 1)
    base_weight = df["avg_fp"]

    # --- age curve ---
    if age_col in df.columns:
        # players in their prime (22–28) get small boost, decline after 30
        df["age_factor"] = df[age_col].apply(
            lambda a: 1.1 if 22 <= a <= 28 else (0.9 if a >= 31 else 1.0)
        )
    else:
        df["age_factor"] = 1.0

    df["weighted_fp"] = base_weight * (
        0.7 * df["age_factor"] + 0.15 * games_weight + 0.15 * minutes_weight
    )

    # normalize
    min_fp, max_fp = df["weighted_fp"].min(), df["weighted_fp"].max()
    df["perf_norm"] = (df["weighted_fp"] - min_fp) / (max_fp - min_fp)
    return df

def calculate_prices(df: pd.DataFrame) -> pd.DataFrame:
    """
    Convert weighted performance score (weighted_score) to fantasy price,
    handling NaN (rookies) and rounding to nearest 0.5.
    """

    if "weighted_score" not in df.columns:
        raise KeyError("Expected 'weighted_score' column in DataFrame before pricing.")

    # Fill NaNs (rookies, injured, etc.) using curr_norm or minimum weighted_score
    min_score = df["weighted_score"].min()
    df["weighted_score_filled"] = df["weighted_score"].fillna(df["curr_norm"].fillna(min_score))

    # Normalize starting from 0
    min_filled = df["weighted_score_filled"].min()
    df["raw_price"] = (df["weighted_score_filled"] - min_filled)  # starts at 0

    # Determine stretch exponent based on MAX_PRICE_GUIDE vs AVG_BUDGET_PER_PLAYER
    # The bigger the gap, the more stretch
    exponent = TOP_PLAYER_SCALING_FACTOR

    # Apply nonlinear stretch to boost top performers
    if df["raw_price"].max() > 0:
        df["raw_price"] = (df["raw_price"] / df["raw_price"].max()) ** exponent

    # Scale to target mean (without minimum yet)
    target_mean = AVG_BUDGET_PER_PLAYER - MIN_PRICE
    current_mean = df["raw_price"].mean()
    if current_mean > 0:
        df["raw_price"] = df["raw_price"] * (target_mean / current_mean)

    # Add minimum price
    df["raw_price"] = df["raw_price"] + MIN_PRICE

    # Round to nearest 0.5
    df["price"] = df["raw_price"].apply(round_to_half)

    # Fill any remaining NaNs
    df["price"] = df["price"].fillna(MIN_PRICE)

    # Keep columns useful for debugging
    debug_cols = [
        "player_id",
        "curr_norm",
        "past_norm",
        "combined_norm",
        "age",
        "age_factor",
        "weighted_score",
        "weighted_score_filled",
        "perf_norm",
        "raw_price",
        "price",
    ]
    debug_cols = [c for c in debug_cols if c in df.columns]

    return df[debug_cols]

    # Keep consistent fields
    return df.rename(columns={"player_id": "id"})[
        ["id", "price"]
    ]

def update_player_prices(df: pd.DataFrame, supabase, batch_size=100,):
    """Update player prices (and updated_at) in Supabase."""
    now = datetime.now().isoformat()

    df["price_filled"] = df["price"].fillna(4.5)

    updates = [
        {
            "id": int(row["player_id"]),
            "price": float(row["price_filled"]),
            "updated_at": now,
        }
        for _, row in df.iterrows()
    ]

    for i in range(0, len(updates), batch_size):
        chunk = updates[i : i + batch_size]
        supabase.rpc("update_player_prices", {"price_updates": chunk}).execute()

        print(f"Batch {i // batch_size + 1} sent with {len(chunk)} items")

def fill_all_missing_prices(supabase, default_price: float = 4.0, batch_size: int = 100):
    """
    Standalone function to update all players in Supabase with null price.
    Sets their price to `default_price`.
    """
    now = datetime.now().isoformat()

    # Fetch only players with price = null
    response = (
        supabase.table("player")
        .select("id")
        .is_("price", None)
        .execute()
    )
    missing_players = response.data

    if not missing_players:
        print("No missing prices to update.")
        return

    # Prepare updates
    updates = [
        {"id": p["id"], "price": default_price, "updated_at": now}
        for p in missing_players
    ]

    # Update in batches
    for i in range(0, len(updates), batch_size):
        chunk = updates[i : i + batch_size]
        supabase.rpc("update_player_prices", {"price_updates": chunk}).execute()
        print(f"Batch {i // batch_size + 1} updated {len(chunk)} missing prices.")

    print(f"✅ Updated {len(updates)} players with default price {default_price}.")

def clear_all_prices(supabase, batch_size: int = 100):
    """
    Set price to NULL for all players in Supabase.
    """
    now = datetime.now().isoformat()

    # Fetch all player IDs
    response = supabase.table("player").select("id").execute()
    all_players = response.data

    if not all_players:
        print("No players found in the database.")
        return

    # Prepare updates
    updates = [{"id": p["id"], "price": None, "updated_at": now} for p in all_players]

    # Update in batches
    for i in range(0, len(updates), batch_size):
        chunk = updates[i : i + batch_size]
        supabase.rpc("update_player_prices", {"price_updates": chunk}).execute()
        print(f"Batch {i // batch_size + 1} cleared {len(chunk)} prices.")

    print(f"✅ Cleared prices for {len(updates)} players.")

def main():
    supabase = create_client(os.getenv("SUPABASE_URL"), os.getenv("SUPABASE_SERVICE_KEY"))
    # clear_all_prices(supabase)

    print("📊 Fetching current and past player averages...")
    current_df = fetch_player_averages_from_db(supabase)
    past_df = fetch_player_history_averages(supabase, LAST_SEASON_ID)

    print("🎂 Fetching player ages...")
    age_df = fetch_player_birthdates(supabase)  # already includes `age`

    # --------------------------------------------------------
    # 1️⃣ Compute normalized fantasy performance per season
    # --------------------------------------------------------
    print("⚙️ Computing normalized scores for current season...")
    current_df = compute_weighted_fantasy(current_df)
    curr_norm = current_df[["player_id", "perf_norm"]].rename(
        columns={"perf_norm": "curr_norm"}
    )

    print("📈 Computing normalized scores for past season...")
    past_df = compute_weighted_fantasy(past_df)
    past_norm = past_df[["player_id", "perf_norm"]].rename(
        columns={"perf_norm": "past_norm"}
    )

    # --------------------------------------------------------
    # 2️⃣ Merge normalized weights
    # --------------------------------------------------------
    print("🔄 Combining current (70%) and past (30%) normalized scores...")
    merged = pd.merge(curr_norm, past_norm, on="player_id", how="outer")  # use outer so we get all players

    merged["combined_norm"] = np.where(
        merged["curr_norm"].notna(),
        # has current season → weighted 70/30
        merged["curr_norm"] * 0.7 + merged["past_norm"].fillna(0) * 0.3,
        # no current season → use past season 70%
        merged["past_norm"].fillna(0) * 0.9
    )

    # --------------------------------------------------------
    # 3️⃣ Add age and apply adjustment (already computed)
    # --------------------------------------------------------
    print("🎯 Applying age adjustment to final score...")
    merged = pd.merge(merged, age_df, on="player_id", how="left")

    def age_weight(age):
        if pd.isna(age):
            return 1.0
        if age < 20:
            return 1
        elif age < 24:
            return 1.1
        elif age < 28:
            return 1.05
        elif age < 31:
            return 0.95
        elif age < 35:
            return 0.90
        else:
            return 1.0

    merged["age_factor"] = merged["age"].apply(age_weight)
    # Apply age factor to the combined_norm BEFORE normalizing
    merged["weighted_score"] = merged["combined_norm"] * merged["age_factor"]

    # --------------------------------------------------------
    # 4️⃣ Handle rookies / NaNs before price calculation
    # --------------------------------------------------------
    min_score = merged["weighted_score"].min()
    merged["weighted_score"] = merged["weighted_score"].fillna(merged["curr_norm"].fillna(min_score))

    # --------------------------------------------------------
    # 4️⃣ Calculate prices from final score
    # --------------------------------------------------------
    merged = merged.rename(columns={"final_score": "perf_norm"})
    print("💰 Calculating prices...")
    priced_df = calculate_prices(merged)

    plot_price_distribution(priced_df)

    # os.makedirs("test_data", exist_ok=True)
    # timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    # output_path = f"test_data/player_prices_{timestamp}.csv"

    # priced_df.to_csv(output_path, index=False)
    # print(f"📁 Saved player prices CSV → {output_path}")
    # price_job_logger.info(f"Saved player prices CSV → {output_path} (n={len(priced_df)})")

    print("⬆️ Updating Supabase player prices...")
    price_job_logger.info("Starting Supabase update for player prices...")
    update_player_prices(priced_df, supabase)
    price_job_logger.info(f"Supabase update complete for {len(priced_df)} players.")

    fill_all_missing_prices(supabase, default_price=MIN_PRICE)

    print(
        f"✅ Done! Avg price: {priced_df['price'].mean():.2f}, "
        f"Range: {priced_df['price'].min()}–{priced_df['price'].max()}"
    )


if __name__ == "__main__":
    main()

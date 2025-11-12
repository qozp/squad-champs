import matplotlib.pyplot as plt
import numpy as np
import pandas as pd

def plot_price_distribution(df: pd.DataFrame, title: str = "Distribution of Player Prices"):
    """
    Plot a histogram of player prices and print summary statistics.

    Args:
        df: DataFrame with a 'price' column.
        title: Optional title for the plot.
    """
    if "price" not in df.columns:
        raise KeyError("DataFrame must contain a 'price' column.")

    # --- Summary statistics ---
    print("📊 Price Summary Statistics:")
    print(df['price'].describe())
    # print("\nCounts per unique price:")
    print(df['price'].value_counts().sort_index())

    # --- Histogram ---
    plt.figure(figsize=(10,6))
    # Use half-step bins if prices are in 0.5 increments
    bins = np.arange(df['price'].min(), df['price'].max() + 0.5, 0.5)
    plt.hist(df['price'], bins=bins, edgecolor='black')
    plt.xlabel("Price")
    plt.ylabel("Number of players")
    plt.title(title)
    plt.xticks(bins)
    plt.grid(axis='y', alpha=0.75)
    plt.show()

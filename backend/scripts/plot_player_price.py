import pandas as pd
import matplotlib.pyplot as plt

# Load your CSV
df = pd.read_csv("test_data/player_prices_20251112_160227.csv")

# --- Summary statistics ---
print("📊 Price Summary Statistics:")
print(df['price'].describe())
print("\nCounts per unique price:")
print(df['price'].value_counts().sort_index())

# --- Plot histogram of prices ---
plt.figure(figsize=(10,6))

# Use half-step bins if your prices are in 0.5 increments
import numpy as np
bins = np.arange(df['price'].min(), df['price'].max() + 0.5, 0.5)

plt.hist(df['price'], bins=bins, edgecolor='black')
plt.xlabel("Price")
plt.ylabel("Number of players")
plt.title("Distribution of Player Prices")
plt.xticks(bins)
plt.grid(axis='y', alpha=0.75)
plt.show()

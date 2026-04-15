import tkinter as tk
from tkinter import ttk, messagebox
import pandas as pd
import matplotlib.pyplot as plt
import yfinance as yf
from datetime import datetime

# Popular stocks list
stocks = {
    "Apple (AAPL)": "AAPL",
    "Tesla (TSLA)": "TSLA",
    "Amazon (AMZN)": "AMZN",
    "Google (GOOGL)": "GOOGL",
    "Infosys (INFY.NS)": "INFY.NS",
    "TCS (TCS.NS)": "TCS.NS"
}

def analyze_stock():
    symbol = stock_var.get()
    start = start_date.get()
    end = end_date.get()

    if symbol == "":
        messagebox.showerror("Error", "Select a stock!")
        return

    try:
        stock = yf.download(symbol, start=start, end=end)

        if stock.empty:
            messagebox.showerror("Error", "No data found!")
            return

        # Moving averages
        stock['SMA_20'] = stock['Close'].rolling(20).mean()
        stock['SMA_50'] = stock['Close'].rolling(50).mean()

        # Buy/Sell Signal
        stock['Signal'] = 0
        stock['Signal'][20:] = (
            (stock['SMA_20'][20:] > stock['SMA_50'][20:]).astype(int)
        )
        stock['Position'] = stock['Signal'].diff()

        # Plot
        plt.figure(figsize=(12,6))
        plt.plot(stock['Close'], label="Close Price")
        plt.plot(stock['SMA_20'], label="20 SMA", linestyle='--')
        plt.plot(stock['SMA_50'], label="50 SMA", linestyle='--')

        # Buy signals
        plt.plot(stock[stock['Position'] == 1].index,
                 stock['SMA_20'][stock['Position'] == 1],
                 '^', markersize=10, label='BUY')

        # Sell signals
        plt.plot(stock[stock['Position'] == -1].index,
                 stock['SMA_20'][stock['Position'] == -1],
                 'v', markersize=10, label='SELL')

        plt.legend()
        plt.title(f"{symbol} Trend Analysis")
        plt.grid()
        plt.show()

    except Exception as e:
        messagebox.showerror("Error", str(e))


# GUI setup
root = tk.Tk()
root.title("Stock Analyzer Pro")
root.geometry("400x350")

# Dropdown
tk.Label(root, text="Select Stock").pack()
stock_var = tk.StringVar()
dropdown = ttk.Combobox(root, textvariable=stock_var,
                        values=list(stocks.values()))
dropdown.pack()

# Date inputs
tk.Label(root, text="Start Date (YYYY-MM-DD)").pack()
start_date = tk.Entry(root)
start_date.insert(0, "2022-01-01")
start_date.pack()

tk.Label(root, text="End Date (YYYY-MM-DD)").pack()
end_date = tk.Entry(root)
end_date.insert(0, "2024-01-01")
end_date.pack()

# Button
tk.Button(root, text="Analyze", command=analyze_stock).pack(pady=20)

root.mainloop()
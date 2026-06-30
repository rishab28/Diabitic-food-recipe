import csv
import os

file_path = "ads data/Untitled-report-Jun-19-2026-to-Jun-23-2026.csv"

try:
    with open(file_path, "r", encoding="utf-8-sig") as f:
        reader = csv.reader(f)
        headers = next(reader)
        print("HEADERS:")
        for i, h in enumerate(headers):
            print(f"{i}: {h}")
            
        print("\nFIRST 3 ROWS:")
        for _ in range(3):
            print(next(reader))
except Exception as e:
    print("Error reading with utf-8-sig:", e)

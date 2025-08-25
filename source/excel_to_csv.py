# This script creates a CSV file in the csv/ folder per language/dialect sheet
# in the chart-source.xlsx Excel file

from pathlib import Path
import pandas as pd


xls = pd.ExcelFile(Path(__file__).parent / "chart-source.xlsx")

for sheet_name in xls.sheet_names:
    if sheet_name not in ["README", "Purposes", "Template"]:
        df = pd.read_excel(xls, sheet_name=sheet_name)
        csv_file_name = f"{sheet_name}.csv"
        df.to_csv(Path(__file__).parent / "csv" / csv_file_name, index=False)
        print(f"Saved {sheet_name} to {csv_file_name}")
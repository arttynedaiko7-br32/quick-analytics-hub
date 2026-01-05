import pandas as pd
from fastapi import UploadFile

def parse_excel(file: UploadFile):
    df_dict = pd.read_excel(file.file, sheet_name=None)

    sheets = []
    for name, df in df_dict.items():
        sheets.append({
            "name": name,
            "rows": len(df),
            "columns": list(df.columns),
            "preview": df.head(5).fillna("").to_dict(orient="records")
        })

    return sheets

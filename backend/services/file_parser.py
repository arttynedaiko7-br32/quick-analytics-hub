import pandas as pd
import io
import re
import math


def extract_number(value):
    if value is None:
        return None

    if isinstance(value, (int, float)):
        if isinstance(value, float) and math.isnan(value):
            return None
        return float(value)

    if isinstance(value, str):
        value = value.replace(",", ".")
        numbers = re.findall(r"\d+\.?\d*", value)
        if numbers:
            return float(numbers[-1])

    return None


def detect_header_row(df: pd.DataFrame):
    for i in range(min(10, len(df))):
        row = df.iloc[i]
        non_empty = sum(
            1 for v in row.values
            if isinstance(v, str) and v.strip()
        )
        if non_empty >= max(2, len(row) // 2):
            return i
    return 0


def is_garbage_row(row: pd.Series):
    first_cell = str(row.iloc[0]).lower()
    garbage_markers = [
        "итог",
        "*",
        "данные",
        "всего",
        "поясн"
    ]
    return any(m in first_cell for m in garbage_markers)


def parse_excel(source):
    # ---------- источник ----------
    if hasattr(source, "file"):
        source.file.seek(0)
        excel_source = source.file
    elif isinstance(source, io.BytesIO):
        source.seek(0)
        excel_source = source
    else:
        raise ValueError(f"Unsupported file type: {type(source)}")

    raw_sheets = pd.read_excel(
        excel_source,
        sheet_name=None,
        header=None
    )

    sheets = []

    for sheet_name, df in raw_sheets.items():
        if df.empty:
            sheets.append({
                "name": sheet_name,
                "rows": 0,
                "columns": [],
                "preview": [],
                "data": []
            })
            continue

        # ---------- 1️⃣ заголовки ----------
        header_row_index = detect_header_row(df)
        headers = df.iloc[header_row_index].fillna("").astype(str).tolist()

        data_df = df.iloc[header_row_index + 1:].copy()
        data_df.columns = headers

        # ---------- 2️⃣ чистка ----------
        data_df = data_df.dropna(how="all")

        if not data_df.empty:
            data_df = data_df[~data_df.apply(is_garbage_row, axis=1)]

        if data_df.empty:
            continue

        # ---------- 3️⃣ нормализация чисел ----------
        for col in data_df.columns:
            data_df[col] = data_df[col].apply(extract_number)

        sheets.append({
            "name": sheet_name,
            "rows": len(data_df),
            "columns": list(data_df.columns),
            "preview": data_df.head(5).fillna("").to_dict(orient="records"),
            "data": data_df.fillna("").to_dict(orient="records"),
        })

    return sheets

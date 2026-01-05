import pandas as pd
import numpy as np


def basic_analytics(data: list[dict]):
    if not data or not isinstance(data, list):
        raise ValueError("Invalid data format")

    df = pd.DataFrame(data)

    numeric_df = df.select_dtypes(include=[np.number])

    result = {
        "stats": {},
        "averages": {},
        "correlations": {},
        "trends": {}
    }

    # ---------- 1️⃣ ОПИСАТЕЛЬНАЯ СТАТИСТИКА ----------
    if not numeric_df.empty:
        result["stats"] = numeric_df.describe().to_dict()

    # ---------- 1.1️⃣ СРЕДНИЕ ЗНАЧЕНИЯ (ЯВНО) ----------
    for column in numeric_df.columns:
        mean_value = numeric_df[column].mean()
        if not np.isnan(mean_value):
            result["averages"][column] = round(float(mean_value), 3)

    # ---------- 2️⃣ КОРРЕЛЯЦИИ ----------
    if numeric_df.shape[1] >= 2:
        result["correlations"] = numeric_df.corr().round(3).to_dict()

    # ---------- 3️⃣ ТРЕНДЫ ----------
    for column in numeric_df.columns:
        values = numeric_df[column].dropna().values

        if len(values) < 2:
            continue

        x = np.arange(len(values))
        slope = np.polyfit(x, values, 1)[0]

        if slope > 0:
            direction = "up"
        elif slope < 0:
            direction = "down"
        else:
            direction = "flat"

        result["trends"][column] = {
            "direction": direction,
            "slope": round(float(slope), 4)
        }

    return result


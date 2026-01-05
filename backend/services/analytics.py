import pandas as pd

def basic_analytics(data: list):
    df = pd.DataFrame(data)

    return {
        "rows": len(df),
        "columns": list(df.columns),
        "stats": df.describe(include="all").fillna("").to_dict(),
        "missing_values": df.isnull().sum().to_dict()
    }

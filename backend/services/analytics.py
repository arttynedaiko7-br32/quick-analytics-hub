import pandas as pd
import numpy as np
import re

def to_native(val):
    if isinstance(val, (np.integer, np.int64)): return int(val)
    if isinstance(val, (np.floating, np.float64)): return float(val)
    return val

def extract_currency(col_name: str) -> str:
    """Пытается найти код валюты в названии колонки."""
    s = col_name.lower()
    if 'usd' in s or '$' in s: return 'USD'
    if 'eur' in s or '€' in s: return 'EUR'
    if 'rub' in s or 'руб' in s or '₽' in s: return 'RUB'
    if 'kz' in s or 'тенге' in s: return 'KZT'
    return 'Unknown' # Если валюта не указана

def classify_column_type(col_name: str) -> str:
    s = col_name.lower()
    
    # 1. Сначала ищем явные признаки КОЛИЧЕСТВА/ОБЪЕМА
    # (Они важнее, так как "Total Returns (count)" содержит и "Total", и "count")
    volume_keywords = [
        'count', 'qty', 'quantity', 'штук', 'кол-во', 'items', 'units', 
        'квт', 'kwh', 'м3', 'm3', 'литр', 'visits', 'traffic', 'returns'
    ]
    if any(k in s for k in volume_keywords):
        return 'volume'

    # 2. Потом ищем ДЕНЬГИ
    # УБРАЛИ слово "total", так как оно может быть где угодно
    money_keywords = [
        'rub', 'usd', 'eur', 'руб', 'сумма', 'оплата', 'price', 
        'cost', 'money', 'revenue', 'sales', 'budget', 'выручка', 'расход'
    ]
    if any(k in s for k in money_keywords):
        return 'money'
        
    return 'other'

def analyze(data: list[dict]):
    if not data: return {}
    df = pd.DataFrame(data)
    for col in df.columns:
        df[col] = pd.to_numeric(df[col], errors='ignore')

    result = {
        "consumption": {},
        "metrics": {},
        "financial": {},
        "extremes": {},
        "trends": {},
        "anomalies": {},
        "correlations": {},

        "totals": {
            # Теперь здесь будет разбивка по валютам!
            "by_currency": {}, 
            "volume_stats": {} 
        },
        "meta": {}
    }

    # --- 1. Поиск даты (расширенный поиск) ---
    date_col = None
    for col in df.columns:
        col_lower = col.lower()
        if 'месяц' in col_lower or 'период' in col_lower or 'год' in col_lower or 'date' in col_lower or 'дата' in col_lower:
            date_col = col; break
    if not date_col:
        for col in df.columns:
            if pd.api.types.is_datetime64_any_dtype(df[col]):
                date_col = col; break
            if df[col].dtype == object:
                try:
                    pd.to_datetime(df[col].dropna().head(10), errors='raise')
                    date_col = col; break
                except: continue
    if not date_col:
        # Fallback (первая колонка)
        if not df.empty: date_col = df.columns[0]

    if date_col: result["meta"]["period_column"] = date_col

    # --- 2. Анализ колонок ---
    numeric_cols = df.select_dtypes(include=[np.number]).columns.tolist()
    if date_col and date_col in numeric_cols: numeric_cols.remove(date_col)

    counters = []
    others = []
    
    for col in numeric_cols:
        series = df[col].dropna()
        if len(series) < 2: continue
        if series.is_monotonic_increasing: counters.append(col)
        else: others.append(col)

    # --- 3. Счетчики ---
    for col in counters:
        val = df[col].dropna()
        diffs = val.diff().dropna()
        total = float(val.max() - val.min())
        
        result["consumption"][col] = {
            "total": round(total, 3),
            "average_growth": round(float(diffs.mean()), 3) if not diffs.empty else 0
        }
        
        if not diffs.empty:
             slope = np.polyfit(np.arange(len(diffs)), diffs.values, 1)[0]
             result["trends"][col] = "growing" if slope > 0 else "declining"

    # --- 4. Метрики и Деньги ---
    for col in others:
        val = df[col].dropna()
        total = float(val.sum())
        avg = float(val.mean())
        
        c_type = classify_column_type(col)
        
        stats = {"average": round(avg, 2), "total": round(total, 2)}
        
        if c_type == 'money':
            result["financial"][col] = stats
            
            # Умное суммирование по валютам
            curr = extract_currency(col)
            if curr not in result["totals"]["by_currency"]:
                result["totals"]["by_currency"][curr] = 0.0
            result["totals"]["by_currency"][curr] += total
            
        else:
            # Теперь "Total Returns" попадет сюда!
            result["metrics"][col] = stats
            result["totals"]["volume_stats"][col] = round(total, 2)

        # Экстремумы и Аномалии (без изменений)
        max_idx = val.idxmax()
        min_idx = val.idxmin()
        p_max = df.loc[max_idx, date_col] if date_col else "Unknown"
        p_min = df.loc[min_idx, date_col] if date_col else "Unknown"
        result["extremes"][col] = {
            "max": {"value": round(float(val[max_idx]), 2), "period": str(p_max)},
            "min": {"value": round(float(val[min_idx]), 2), "period": str(p_min)}
        }
        
        std = float(val.std())
        if std > 0:
            high_anomalies = df.loc[val.index][val > avg + 2*std]
            low_anomalies = df.loc[val.index][val < avg - 2*std]
            anomalies = pd.concat([high_anomalies, low_anomalies]).sort_index()
            if not anomalies.empty:
                arr = []
                for idx, r in anomalies.iterrows():
                    arr.append({"value": round(float(r[col]), 2), "period": str(r[date_col]) if date_col else ""})
                result["anomalies"][col] = arr

    # Округляем итоги валют
    for curr in result["totals"]["by_currency"]:
        result["totals"]["by_currency"][curr] = round(result["totals"]["by_currency"][curr], 2)

    # --- Генерация данных для графиков ---
    result["charts"] = {}

    # Line chart: тренды по периодам (если есть date_col)
    if date_col:
        line_data = []
        grouped = df.groupby(date_col).sum(numeric_only=True)
        for period, row in grouped.iterrows():
            total = row.sum()
            line_data.append({"name": str(period), "value": round(float(total), 2)})
        result["charts"]["line"] = line_data

    # Bar chart: суммы по финансовым колонкам
    bar_data = []
    for col, stats in result["financial"].items():
        bar_data.append({"name": col, "value": stats["total"]})
    result["charts"]["bar"] = bar_data

    # Pie chart: распределение по валютам
    pie_data = []
    for curr, amount in result["totals"]["by_currency"].items():
        pie_data.append({"name": curr, "value": amount})
    result["charts"]["pie"] = pie_data

    # --- Корреляция между числовыми колонками ---
    if len(numeric_cols) > 1:
        corr_matrix = df[numeric_cols].corr().round(3)
        result["correlations"] = corr_matrix.to_dict()

    return result

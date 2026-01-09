import pandas as pd
import io
import re
import numpy as np

def clean_header_name(val):
    s = str(val).strip()
    return s if s and s.lower() != "nan" else "Unknown_Column"

def str_to_float_safe(val):
    """Безопасная конвертация строки в float для сравнения."""
    try:
        # Убираем все кроме цифр и точки
        clean = re.sub(r'[^\d.]', '', str(val).replace(',', '.'))
        return float(clean)
    except:
        return 0.0

def preprocess_value(val):
    """
    Самая умная очистка:
    Различает:
    - "4300 4354" -> 4354 (Два показания -> берем последнее/макс)
    - "10 500" -> 10500 (Разделитель тысяч -> склеиваем)
    """
    if pd.isna(val) or val == "":
        return np.nan
        
    s = str(val).strip()
    
    # Если уже число — возвращаем строкой
    if isinstance(val, (int, float)):
        return str(val)

    # 1. Заменяем неразрывные пробелы
    s = s.replace('\xa0', ' ')
    
    # 2. Сначала пробуем разбить строку по пробелам
    parts = s.split()
    
    # Если частей несколько, включаем логику "Склеить или Выбрать?"
    if len(parts) > 1:
        # Пробуем превратить части в числа для анализа
        numeric_parts = []
        for p in parts:
            # Очищаем часть от мусора (100руб -> 100)
            clean_p = re.sub(r'[^\d,.-]', '', p)
            if clean_p:
                numeric_parts.append(clean_p)
        
        if len(numeric_parts) >= 2:
            try:
                # Берем два последних числа (обычно это хвост)
                # или первые два, если их всего два.
                # Для надежности берем просто пару соседних.
                val1_str = numeric_parts[0]
                val2_str = numeric_parts[1]
                
                v1 = str_to_float_safe(val1_str)
                v2 = str_to_float_safe(val2_str)
                
                # ЭВРИСТИКА:
                # Если числа "одного порядка" (разница меньше чем в 10 раз),
                # то это РАЗНЫЕ показания (4300 и 4354).
                # Если разница огромная (10 и 500 = в 50 раз), то это ОДНО число (10 500).
                
                ratio = 999
                if v1 > 0 and v2 > 0:
                    ratio = max(v1, v2) / min(v1, v2)
                
                if ratio < 10:
                    # Это разные показания (например 4300 и 4354).
                    # Берем МАКСИМУМ (обычно это "текущее" показание)
                    candidates = [str_to_float_safe(x) for x in numeric_parts]
                    return str(max(candidates))
                else:
                    # Это одно число (10 500). Склеиваем всё обратно.
                    s = s.replace(" ", "")
            except:
                # Если не получилось сравнить, просто склеиваем (безопасный вариант)
                s = s.replace(" ", "")
        else:
            # Если чисел не нашлось, просто убираем пробелы
            s = s.replace(" ", "")
    else:
        # Если пробелов нет, идем дальше
        pass

    # 3. Финальная очистка того, что решили оставить
    # Оставляем цифры, точки, запятые, минус
    s_clean = re.sub(r'[^\d,.-]', '', s)
    
    if not s_clean:
        return np.nan

    # 4. Нормализация разделителей (1.000,00 vs 1,000.00)
    if ',' in s_clean and '.' in s_clean:
        if s_clean.rfind(',') > s_clean.rfind('.'):
            # 1.000,50 -> 1000.50
            s_clean = s_clean.replace('.', '').replace(',', '.')
        else:
            # 1,000.50 -> 1000.50
            s_clean = s_clean.replace(',', '')
    elif ',' in s_clean:
        s_clean = s_clean.replace(',', '.')
        
    return s_clean

def detect_header_index(df: pd.DataFrame, scan_limit=20) -> int:
    """Ищет строку заголовка."""
    best_idx = 0
    max_score = -1
    limit = min(len(df), scan_limit)

    for i in range(limit):
        row = df.iloc[i]
        filled = row.count()
        if filled == 0: continue
            
        strings = row.apply(lambda x: isinstance(x, str) and len(str(x).strip()) > 0).sum()
        unique = row.nunique()
        
        score = (strings * 1.5) + unique
        if score > max_score:
            max_score = score
            best_idx = i
            
    return best_idx

def is_garbage_row(row, headers_count):
    """Фильтрация строк 'Итого' и пустых строк."""
    first_val = str(row.iloc[0]).lower().strip()
    
    # Стоп-слова
    stop_words = ["итого", "всего", "total", "sum", "среднее", "итог"]
    if any(w in first_val for w in stop_words): return True
    
    # Проверка на пустоту (если заполнено < 30% ячеек)
    non_empty = row.count()
    if non_empty < headers_count * 0.3: return True
    
    return False

def parse_excel(source):
    if hasattr(source, "file"):
        source.file.seek(0)
        excel_source = source.file
    elif isinstance(source, io.BytesIO):
        source.seek(0)
        excel_source = source
    else:
        raise ValueError("Unsupported source type")

    try:
        # dtype=str сохраняет исходный вид чисел (4300 4354)
        raw_sheets = pd.read_excel(excel_source, sheet_name=None, header=None, dtype=str)
    except Exception as e:
        raise ValueError(f"Ошибка чтения Excel: {str(e)}")

    parsed_sheets = []

    for sheet_name, df in raw_sheets.items():
        if df.empty: continue
        
        # Удаляем пустые края
        df = df.dropna(how='all', axis=0).dropna(how='all', axis=1)
        if df.empty: continue

        header_idx = detect_header_index(df)
        
        # Заголовки
        headers_raw = df.iloc[header_idx].apply(clean_header_name).tolist()
        headers = []
        counts = {}
        for h in headers_raw:
            if h in counts:
                counts[h] += 1
                headers.append(f"{h}_{counts[h]}")
            else:
                counts[h] = 0
                headers.append(h)

        # Данные
        data_df = df.iloc[header_idx + 1:].copy()
        data_df.columns = headers
        data_df.reset_index(drop=True, inplace=True)

        # Удаление мусора (строки Итого и пустые)
        mask = data_df.apply(lambda row: is_garbage_row(row, len(headers)), axis=1)
        data_df = data_df[~mask]

        # Конвертация данных
        for col in data_df.columns:
            series_clean = data_df[col].apply(preprocess_value)
            series_numeric = pd.to_numeric(series_clean, errors='coerce')
            
            non_na_orig = data_df[col].notna().sum()
            non_na_new = series_numeric.notna().sum()
            
            # Если >60% значений удалось превратить в числа - это числовая колонка
            if non_na_orig > 0 and (non_na_new / non_na_orig > 0.6):
                data_df[col] = series_numeric
            else:
                data_df[col] = data_df[col].astype(str).str.strip().replace('nan', '')

        data_df = data_df.dropna(how='all').replace({np.nan: None})
        records = data_df.to_dict(orient='records')
        
        if not records: continue

        parsed_sheets.append({
            "name": sheet_name,
            "rows": len(records),
            "columns": headers,
            "preview": records[:5],
            "data": records
        })

    return parsed_sheets

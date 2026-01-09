from fastapi import FastAPI, UploadFile, File, HTTPException, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import RedirectResponse
import requests
import io

# Импорты парсеров (поддержка и папки services, и корня)
try:
    from services.file_parser import parse_excel
    from services.analytics import analyze as basic_analytics
except ImportError:
    from file_parser import parse_excel
    from analytics import analyze as basic_analytics

app = FastAPI(title="Quick Analytics API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------- 🆕 ГЛАВНАЯ СТРАНИЦА ----------
@app.get("/")
async def root():
    return RedirectResponse(url="/docs")


# ---------- Excel upload ----------
@app.post("/upload/file")
async def upload_file(file: UploadFile = File(...)):
    try:
        sheets = parse_excel(file)
        return {"type": "file", "sheets": sheets}
    except Exception as e:
        print(f"Error parsing file: {e}")
        raise HTTPException(status_code=400, detail=f"Ошибка обработки файла: {str(e)}")


# ---------- Google Sheets ----------
@app.post("/upload/google-sheet")
async def upload_google_sheet(url: str = Form(...)):
    try:
        if "/spreadsheets/d/" not in url:
            raise HTTPException(status_code=400, detail="Некорректная ссылка Google Sheets")

        try:
            sheet_id = url.split("/spreadsheets/d/")[1].split("/")[0]
        except IndexError:
             raise HTTPException(status_code=400, detail="Не удалось найти ID таблицы")

        export_url = (
            f"https://docs.google.com/spreadsheets/d/{sheet_id}/export?format=xlsx"
        )

        print(f"Downloading Google Sheet: {export_url}")

        # ⬇️ ВАЖНО: Добавляем заголовки, чтобы Google не блокировал нас
        headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8"
        }

        # timeout=15 секунд, чтобы не висело вечно
        response = requests.get(export_url, headers=headers, timeout=15)
        
        if response.status_code != 200:
            # Если 403/401 - значит таблица закрыта настройками приватности
            if response.status_code in [401, 403]:
                raise HTTPException(status_code=400, detail="Нет доступа к таблице. Убедитесь, что доступ открыт по ссылке (Anyone with the link).")
            
            raise HTTPException(status_code=400, detail=f"Ошибка Google: {response.status_code}")

        file_bytes = io.BytesIO(response.content)

        sheets = parse_excel(file_bytes)

        return {"type": "google_sheet", "sheets": sheets}

    except HTTPException:
        raise
    except Exception as e:
        print(f"Error google sheet: {e}")
        raise HTTPException(status_code=400, detail=f"Ошибка загрузки: {str(e)}")


# ---------- Analytics ----------
@app.post("/analyze")
async def analyze(payload: dict):
    try:
        data = payload.get("data")

        if not data:
            raise HTTPException(status_code=400, detail="Поле 'data' обязательно")

        result = basic_analytics(data)

        return {
            "status": "ok",
            "analysis": result
        }

    except Exception as e:
        print(f"Analytics error: {e}")
        raise HTTPException(status_code=400, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

from fastapi import FastAPI, UploadFile, File, HTTPException, Form
from fastapi.middleware.cors import CORSMiddleware
import requests
import io

from services.file_parser import parse_excel
from services.analytics import basic_analytics

app = FastAPI(title="Quick Analytics API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------- Excel upload ----------
@app.post("/upload/file")
async def upload_file(file: UploadFile = File(...)):
    try:
        sheets = parse_excel(file)
        return {"type": "file", "sheets": sheets}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


# ---------- Google Sheets ----------
@app.post("/upload/google-sheet")
async def upload_google_sheet(url: str = Form(...)):
    try:
        if "/spreadsheets/d/" not in url:
            raise HTTPException(status_code=400, detail="Invalid Google Sheets URL")

        sheet_id = url.split("/spreadsheets/d/")[1].split("/")[0]

        export_url = (
            f"https://docs.google.com/spreadsheets/d/{sheet_id}/export?format=xlsx"
        )

        response = requests.get(export_url)
        if response.status_code != 200:
            raise HTTPException(status_code=400, detail="Cannot fetch Google Sheet")

        file_bytes = io.BytesIO(response.content)

        sheets = parse_excel(file_bytes)

        return {"type": "google_sheet", "sheets": sheets}

    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


# ---------- Analytics ----------
@app.post("/analyze")
async def analyze(payload: dict):
    try:
        data = payload.get("data")

        if not data:
            raise HTTPException(
                status_code=400,
                detail="Field 'data' is required"
            )

        result = basic_analytics(data)

        return {
            "status": "ok",
            "analysis": result
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


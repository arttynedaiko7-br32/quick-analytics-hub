from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from services.file_parser import parse_excel
from services.analytics import basic_analytics

app = FastAPI(title="Quick Analytics API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # потом сузим
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/upload/file")
async def upload_file(file: UploadFile = File(...)):
    try:
        sheets = parse_excel(file)
        return {"sheets": sheets}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.post("/analyze")
async def analyze(payload: dict):
    """
    payload = {
      sheet_name: str,
      data: [...]
    }
    """
    try:
        result = basic_analytics(payload["data"])
        return result
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

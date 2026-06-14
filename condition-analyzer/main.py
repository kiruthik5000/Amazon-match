from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from app.analyzer import compute_condition_score
from app.grader import assign_grade

app = FastAPI(
    title="Product Condition Analyzer",
    description="Analyzes product images and estimates visual condition grade.",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["POST"],
    allow_headers=["*"],
)

# ── Response schema ───────────────────────────────────────────────────────────

class ConditionResponse(BaseModel):
    grade: str
    label: str
    confidence: float
    condition_score: float
    details: dict


# ── Endpoint ──────────────────────────────────────────────────────────────────

ALLOWED_CONTENT_TYPES = {"image/jpeg", "image/png", "image/webp", "image/bmp"}

@app.post("/condition/analyze", response_model=ConditionResponse)
async def analyze_condition(file: UploadFile = File(...)):
    if file.content_type not in ALLOWED_CONTENT_TYPES:
        raise HTTPException(
            status_code=415,
            detail=f"Unsupported file type '{file.content_type}'. Use JPEG, PNG, WEBP, or BMP.",
        )

    img_bytes = await file.read()
    if len(img_bytes) == 0:
        raise HTTPException(status_code=400, detail="Uploaded file is empty.")

    try:
        condition_score, details = compute_condition_score(img_bytes)
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))

    result = assign_grade(condition_score)

    return ConditionResponse(
        grade=result.grade,
        label=result.label,
        confidence=result.confidence,
        condition_score=result.condition_score,
        details=details,
    )


@app.get("/health")
def health():
    return {"status": "ok"}

# Product Condition Analyzer — FastAPI Microservice

Analyzes uploaded product images using **OpenCV** + **PyTorch MobileNetV3** and returns a visual condition grade.

## Folder Structure

```
condition-analyzer/
├── app/
│   ├── __init__.py
│   ├── analyzer.py      # OpenCV preprocessing + MobileNetV3 inference
│   └── grader.py        # Score → A/B/C/D grade logic
├── main.py              # FastAPI app + POST /condition/analyze
├── requirements.txt
└── README.md
```

## Setup

```bash
cd condition-analyzer

# Create virtual environment
python -m venv venv
venv\Scripts\activate        # Windows
# source venv/bin/activate   # macOS / Linux

# Install dependencies
pip install -r requirements.txt

# Run the server
uvicorn main:app --reload --port 8001
```

## API

### `POST /condition/analyze`

Upload a product image and receive a condition grade.

**Request** — `multipart/form-data`

| Field | Type | Description |
|-------|------|-------------|
| file  | File | JPEG / PNG / WEBP / BMP image |

**Response — `200 OK`**

```json
{
  "grade": "B",
  "label": "Good",
  "confidence": 0.82,
  "condition_score": 67.45,
  "details": {
    "model_confidence": 0.312,
    "blur_score": 243.5,
    "scratch_ratio": 0.042,
    "brightness": 134.2,
    "contrast": 51.8
  }
}
```

**Grade Scale**

| Grade | Score Range | Label     |
|-------|-------------|-----------|
| A     | 75 – 100    | Like New  |
| B     | 55 – 74     | Good      |
| C     | 35 – 54     | Fair      |
| D     |  0 – 34     | Poor      |

**Error Responses**

| Status | Reason |
|--------|--------|
| 400    | Empty file |
| 415    | Unsupported image type |
| 422    | Image could not be decoded |

### `GET /health`

```json
{ "status": "ok" }
```

## Algorithm

```
condition_score =
    model_confidence  × 0.40   (MobileNetV3 top-1 softmax — structural intactness)
  + blur_score_norm   × 0.25   (Laplacian variance — sharpness)
  + scratch_norm      × 0.20   (inverted Canny edge ratio — surface damage)
  + brightness_norm   × 0.10   (Gaussian bell around 128 — exposure quality)
  + contrast_norm     × 0.05   (std-dev — visual richness)
  × 100
```

## Integration with Spring Boot Life Score

Call this service first to get the `conditionGrade`, then pass it to:

```
POST http://localhost:8080/lifescore/calculate
{
  "conditionGrade": "B",
  "productAgeYears": 3,
  "popularityScore": 75
}
```

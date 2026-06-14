# ReMatch Price Predictor

FastAPI service that predicts the optimal resale price for a product.

## Run

```bash
pip install -r requirements.txt
uvicorn main:app --reload --port 8002
```

## Endpoint

```
POST /price/predict
```

### Request
```json
{
  "original_price": 25000,
  "product_age_years": 1,
  "condition_grade": "A",
  "category": "Electronics",
  "demand_score": 72
}
```

### Response
```json
{
  "recommended_price": 18900.0,
  "price_floor": 2500.0,
  "price_ceiling": 22500.0,
  "depreciation_rate": 0.244,
  "demand_adjustment": 1.158,
  "condition_multiplier": 0.80,
  "age_decay_factor": 0.7937,
  "confidence": 0.88,
  "summary": "Grade A (Like New) Electronics priced at ₹18,900 — 24.4% off original. ..."
}
```

from pydantic import BaseModel, Field
from typing import Literal


class PricePredictionRequest(BaseModel):
    original_price: float = Field(..., gt=0, description="Original purchase price in INR")
    product_age_years: float = Field(..., ge=0, le=30, description="Age of the product in years")
    condition_grade: Literal["A", "B", "C", "D"] = Field(..., description="AI-assigned condition grade")
    category: str = Field(..., min_length=1, description="Product category")
    demand_score: float = Field(..., ge=0, le=100, description="Market demand score 0–100")


class PricePredictionResponse(BaseModel):
    recommended_price: float
    price_floor: float
    price_ceiling: float
    depreciation_rate: float        # 0.0–1.0, how much value was lost
    demand_adjustment: float        # multiplier applied for demand
    condition_multiplier: float     # multiplier applied for grade
    age_decay_factor: float         # multiplier applied for age
    confidence: float               # 0.0–1.0 prediction confidence
    summary: str

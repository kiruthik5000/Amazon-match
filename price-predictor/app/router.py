from fastapi import APIRouter
from app.models import PricePredictionRequest, PricePredictionResponse
from app.predictor import predict

router = APIRouter(prefix="/price", tags=["price-prediction"])


@router.post("/predict", response_model=PricePredictionResponse)
def predict_price(request: PricePredictionRequest) -> PricePredictionResponse:
    return predict(request)

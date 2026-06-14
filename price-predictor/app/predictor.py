import math
from app.models import PricePredictionRequest, PricePredictionResponse

# ── Grade base multipliers ─────────────────────────────────────────────────────
# What fraction of original price a grade represents at age 0
_GRADE_MULTIPLIER = {
    "A": 0.80,   # Like New
    "B": 0.65,   # Good
    "C": 0.45,   # Fair
    "D": 0.25,   # Poor
}

# ── Category depreciation half-life (years) ───────────────────────────────────
# Exponential decay: value(t) = initial * e^(-ln2 / half_life * t)
# Shorter half-life → faster depreciation
_HALF_LIFE = {
    "electronics":        1.5,
    "mobile phones":      1.2,
    "laptops":            2.0,
    "men's clothing":     3.0,
    "women's clothing":   3.0,
    "jewellery":          8.0,
    "home & kitchen":     4.0,
    "sports & outdoors":  3.5,
    "books":              6.0,
    "toys & games":       2.5,
    "default":            3.0,
}

# ── Demand adjustment range ────────────────────────────────────────────────────
# demand_score 0 → -15%  |  50 → 0%  |  100 → +20%
_DEMAND_MIN_FACTOR = 0.85
_DEMAND_MAX_FACTOR = 1.20


def _half_life_for(category: str) -> float:
    return _HALF_LIFE.get(category.lower().strip(), _HALF_LIFE["default"])


def _age_decay(age_years: float, half_life: float) -> float:
    """Exponential decay factor in [0, 1]; 1.0 means no decay."""
    return math.exp(-math.log(2) / half_life * age_years)


def _demand_factor(demand_score: float) -> float:
    """Linearly maps demand 0–100 onto [DEMAND_MIN, DEMAND_MAX]."""
    t = demand_score / 100.0
    return _DEMAND_MIN_FACTOR + t * (_DEMAND_MAX_FACTOR - _DEMAND_MIN_FACTOR)


def _confidence(grade: str, age_years: float, demand_score: float) -> float:
    """
    Higher confidence when:
    - grade is A or B (AI analysis is more reliable for well-preserved items)
    - product is not too old (decay curve is well-calibrated for 0-5 years)
    - demand score is in mid-range (extremes introduce uncertainty)
    """
    grade_conf   = {"A": 0.95, "B": 0.88, "C": 0.78, "D": 0.65}.get(grade, 0.70)
    age_conf     = max(0.60, 1.0 - age_years * 0.04)
    demand_conf  = 1.0 - abs(demand_score - 50) / 200  # peaks at 50, dips at extremes
    return round((grade_conf + age_conf + demand_conf) / 3, 4)


def predict(req: PricePredictionRequest) -> PricePredictionResponse:
    grade_mult   = _GRADE_MULTIPLIER[req.condition_grade]
    half_life    = _half_life_for(req.category)
    age_decay    = _age_decay(req.product_age_years, half_life)
    demand_adj   = _demand_factor(req.demand_score)

    # Core price: originalPrice × gradeMultiplier × ageDecay × demandAdjustment
    raw_price = req.original_price * grade_mult * age_decay * demand_adj

    # Floor: never go below 10% of original (scrap/parts value)
    # Ceiling: never exceed 90% of original (even grade A depreciates somewhat)
    price_floor   = round(max(req.original_price * 0.10, 1.0), 2)
    price_ceiling = round(req.original_price * 0.90, 2)

    recommended = round(min(max(raw_price, price_floor), price_ceiling), 2)

    depreciation_rate = round(1.0 - recommended / req.original_price, 4)

    confidence = _confidence(req.condition_grade, req.product_age_years, req.demand_score)

    summary = _build_summary(
        req, recommended, grade_mult, age_decay, demand_adj, depreciation_rate
    )

    return PricePredictionResponse(
        recommended_price=recommended,
        price_floor=price_floor,
        price_ceiling=price_ceiling,
        depreciation_rate=depreciation_rate,
        demand_adjustment=round(demand_adj, 4),
        condition_multiplier=grade_mult,
        age_decay_factor=round(age_decay, 4),
        confidence=confidence,
        summary=summary,
    )


def _build_summary(req, price, grade_mult, age_decay, demand_adj, depreciation_rate) -> str:
    grade_label = {"A": "Like New", "B": "Good", "C": "Fair", "D": "Poor"}[req.condition_grade]
    demand_label = (
        "high market demand" if req.demand_score >= 70
        else "moderate demand" if req.demand_score >= 40
        else "low market demand"
    )
    disc = round(depreciation_rate * 100, 1)
    return (
        f"Grade {req.condition_grade} ({grade_label}) {req.category} priced at "
        f"₹{price:,.0f} — {disc}% off original. "
        f"Age decay: {round(age_decay*100,1)}% retained value after "
        f"{req.product_age_years:.1f} yr(s). {demand_label.capitalize()} applied "
        f"a {round((demand_adj-1)*100,1):+.1f}% demand adjustment."
    )

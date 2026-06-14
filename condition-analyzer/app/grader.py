from dataclasses import dataclass

@dataclass
class GradeResult:
    grade: str
    confidence: float        # 0.0 – 1.0
    condition_score: float   # 0 – 100
    label: str


# ── Thresholds ────────────────────────────────────────────────────────────────
#   A  ≥ 75   Like New / Excellent
#   B  ≥ 55   Good
#   C  ≥ 35   Fair / Acceptable
#   D  <  35  Poor / Heavily Used

_THRESHOLDS = [
    (75, "A", "Like New"),
    (55, "B", "Good"),
    (35, "C", "Fair"),
    ( 0, "D", "Poor"),
]


def assign_grade(condition_score: float) -> GradeResult:
    for threshold, grade, label in _THRESHOLDS:
        if condition_score >= threshold:
            confidence = _grade_confidence(condition_score, threshold)
            return GradeResult(
                grade=grade,
                confidence=round(confidence, 4),
                condition_score=condition_score,
                label=label,
            )
    # Fallback (should never reach here)
    return GradeResult(grade="D", confidence=1.0, condition_score=condition_score, label="Poor")


def _grade_confidence(score: float, lower_bound: float) -> float:
    """
    How far into the current band is the score?
    Returns a value in (0.5, 1.0]: closer to the top = more confident.
    """
    next_bound = lower_bound + 20.0   # each band spans ~20 points
    band_width = next_bound - lower_bound
    position   = (score - lower_bound) / band_width
    # Scale to [0.50, 1.00] so even borderline grades show ≥ 50 % confidence
    return 0.50 + min(position, 1.0) * 0.50

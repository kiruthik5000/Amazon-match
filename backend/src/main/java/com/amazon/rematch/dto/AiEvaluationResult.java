package com.amazon.rematch.dto;

import lombok.Builder;
import lombok.Value;

import java.math.BigDecimal;

/**
 * Aggregated AI evaluation result derived from analysing all uploaded images.
 * Passed from ConditionAnalysisService → ListingService for persistence.
 */
@Value
@Builder
public class AiEvaluationResult {

    /** Best grade across all images: A / B / C / D */
    String     conditionGrade;

    /** Integer confidence percentage 0–100 (averaged across images) */
    int        confidenceScore;

    /** Integer life score 0–100 (averaged condition_score across images) */
    int        lifeScore;

    /** Estimated resale value derived from originalPrice × grade multiplier */
    BigDecimal estimatedResaleValue;

    /** Human-readable AI summary built from per-image details */
    String     aiSummary;
}

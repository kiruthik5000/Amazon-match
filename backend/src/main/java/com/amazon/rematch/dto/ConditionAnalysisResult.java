package com.amazon.rematch.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

/**
 * Maps the response from FastAPI POST /condition/analyze
 *
 * {
 *   "grade":           "A",
 *   "label":           "Like New",
 *   "confidence":      0.8762,
 *   "condition_score": 83.41,
 *   "details": { "blur_score": ..., "scratch_ratio": ..., ... }
 * }
 */
@Data
@NoArgsConstructor
public class ConditionAnalysisResult {

    private String grade;
    private String label;

    /** Raw 0.0–1.0 confidence from FastAPI */
    private double confidence;

    @JsonProperty("condition_score")
    private double conditionScore;

    /** Low-level vision signals: blur_score, scratch_ratio, brightness, contrast */
    private Map<String, Object> details;

    // ── Convenience helpers used by the aggregator ────────────────────────────

    /** Confidence as an integer percentage 0–100 */
    public int confidencePercent() {
        return (int) Math.round(confidence * 100);
    }

    /** conditionScore rounded to nearest integer, used as life score */
    public int lifeScoreInt() {
        return (int) Math.round(conditionScore);
    }
}

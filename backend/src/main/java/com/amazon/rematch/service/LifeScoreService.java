package com.amazon.rematch.service;

import com.amazon.rematch.dto.BedrockExplanationResponse;
import com.amazon.rematch.dto.LifeScoreRequest;
import com.amazon.rematch.dto.LifeScoreResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class LifeScoreService {

    private final BedrockService bedrockService;

    @Value("${bedrock.modelId}")
    private String modelId;

    private static final int MAX_AGE_YEARS = 10;

    /**
     * Weights: Condition 50%, Age 30%, Popularity 20%
     */
    public LifeScoreResponse calculate(LifeScoreRequest request) {
        int conditionScore = gradeToScore(request.conditionGrade());
        int ageScore       = ageToScore(request.productAgeYears());
        int popularityScore = clamp(request.popularityScore(), 0, 100);

        int lifeScore = (int) Math.round(
            conditionScore  * 0.50 +
            ageScore        * 0.30 +
            popularityScore * 0.20
        );

        return new LifeScoreResponse(
            clamp(lifeScore, 0, 100),
            conditionScore,
            ageScore,
            popularityScore,
            toGrade(lifeScore)
        );
    }

    /** A=100, B=80, C=60, D=40, F=0 */
    private int gradeToScore(String grade) {
        return switch (grade.toUpperCase()) {
            case "A" -> 100;
            case "B" -> 80;
            case "C" -> 60;
            case "D" -> 40;
            default  -> 0;   // F
        };
    }

    /** Newer products score higher; age capped at MAX_AGE_YEARS */
    private int ageToScore(int ageYears) {
        int capped = Math.min(ageYears, MAX_AGE_YEARS);
        return (int) Math.round(100.0 * (MAX_AGE_YEARS - capped) / MAX_AGE_YEARS);
    }

    /** Human-readable grade for the final life score */
    private String toGrade(int score) {
        if (score >= 85) return "Excellent";
        if (score >= 70) return "Good";
        if (score >= 50) return "Fair";
        if (score >= 30) return "Poor";
        return "Critical";
    }

    private int clamp(int value, int min, int max) {
        return Math.max(min, Math.min(max, value));
    }

    // ── Bedrock explanation ───────────────────────────────────────────────────

    public BedrockExplanationResponse explainLifeScore(LifeScoreRequest request) {
        LifeScoreResponse scores = calculate(request);

        String fallback = String.format(
            "This product has a Life Score of %d/100 (%s), based on its %s condition grade, " +
            "%d-year age, and a popularity score of %d.",
            scores.lifeScore(), scores.grade(),
            request.conditionGrade(), request.productAgeYears(), request.popularityScore()
        );

        String prompt = String.format(
            """
            A product on Amazon ReMatch has been scored with the following breakdown:

            Condition Grade : %s  (contributes 50%% to the score)
            Product Age     : %d year(s)  (contributes 30%%)
            Popularity Score: %d/100  (contributes 20%%)

            Resulting scores:
              Condition Score  : %d/100
              Age Score        : %d/100
              Popularity Score : %d/100
              Final Life Score : %d/100  (%s)

            Write 1-2 sentences explaining what this Life Score means for a customer
            considering buying this product. Mention the key factors driving the score.
            Be positive but accurate. Do not use markdown.
            """,
            request.conditionGrade(), request.productAgeYears(), request.popularityScore(),
            scores.conditionScore(), scores.ageScore(), scores.popularityScore(),
            scores.lifeScore(), scores.grade()
        );

        String explanation = bedrockService.invoke(prompt, fallback);

        return BedrockExplanationResponse.builder()
            .type("LIFE_SCORE")
            .explanation(explanation)
            .modelId(modelId)
            .aiGenerated(!explanation.equals(fallback))
            .build();
    }
}

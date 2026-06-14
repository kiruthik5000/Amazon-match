package com.amazon.rematch.dto;

public record LifeScoreResponse(
    int lifeScore,
    int conditionScore,
    int ageScore,
    int popularityScore,
    String grade
) {}

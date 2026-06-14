package com.amazon.rematch.dto;

import jakarta.validation.constraints.*;

public record LifeScoreRequest(

    @NotNull
    @Pattern(regexp = "[A-Fa-f]", message = "Condition grade must be A, B, C, D, or F")
    String conditionGrade,

    @NotNull
    @Min(value = 0, message = "Product age must be >= 0")
    @Max(value = 100, message = "Product age must be <= 100")
    Integer productAgeYears,

    @NotNull
    @Min(value = 0, message = "Popularity score must be 0–100")
    @Max(value = 100, message = "Popularity score must be 0–100")
    Integer popularityScore
) {}

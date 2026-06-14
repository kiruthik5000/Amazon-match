package com.amazon.rematch.dto;

import jakarta.validation.constraints.*;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class PricePredictionRequest {

    @NotNull
    @DecimalMin("0.01")
    private BigDecimal originalPrice;

    @NotNull
    @DecimalMin("0.0")
    @DecimalMax("30.0")
    private BigDecimal productAgeYears;

    @NotBlank
    @Pattern(regexp = "[A-Da-d]", message = "Condition grade must be A, B, C, or D")
    private String conditionGrade;

    @NotBlank
    private String category;

    @NotNull
    @DecimalMin("0.0")
    @DecimalMax("100.0")
    private BigDecimal demandScore;
}

package com.amazon.rematch.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
public class PricePredictionResponse {

    @JsonProperty("recommended_price")
    private BigDecimal recommendedPrice;

    @JsonProperty("price_floor")
    private BigDecimal priceFloor;

    @JsonProperty("price_ceiling")
    private BigDecimal priceCeiling;

    @JsonProperty("depreciation_rate")
    private Double depreciationRate;

    @JsonProperty("demand_adjustment")
    private Double demandAdjustment;

    @JsonProperty("condition_multiplier")
    private Double conditionMultiplier;

    @JsonProperty("age_decay_factor")
    private Double ageDecayFactor;

    @JsonProperty("confidence")
    private Double confidence;

    @JsonProperty("summary")
    private String summary;
}

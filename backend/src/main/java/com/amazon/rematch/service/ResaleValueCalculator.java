package com.amazon.rematch.service;

import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.Map;

/**
 * Derives an estimated resale value from the seller's original price
 * and the AI-assigned condition grade.
 *
 * Multipliers (prototype — tunable via config or DB table):
 *   A  → 65 %  (like new, high demand)
 *   B  → 50 %  (good condition)
 *   C  → 35 %  (fair, visible wear)
 *   D  → 20 %  (heavy wear / defects)
 */
@Service
public class ResaleValueCalculator {

    private static final Map<String, BigDecimal> MULTIPLIERS = Map.of(
        "A", new BigDecimal("0.65"),
        "B", new BigDecimal("0.50"),
        "C", new BigDecimal("0.35"),
        "D", new BigDecimal("0.20")
    );

    /**
     * @param originalPrice seller-declared original purchase price
     * @param grade         AI-assigned grade letter (A/B/C/D)
     * @return estimated resale value rounded to 2 decimal places
     */
    public BigDecimal calculate(BigDecimal originalPrice, String grade) {
        BigDecimal multiplier = MULTIPLIERS.getOrDefault(
            grade != null ? grade.toUpperCase() : "C",
            new BigDecimal("0.35")
        );
        return originalPrice.multiply(multiplier).setScale(2, RoundingMode.HALF_UP);
    }
}

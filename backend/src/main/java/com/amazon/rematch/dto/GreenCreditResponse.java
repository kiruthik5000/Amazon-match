package com.amazon.rematch.dto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class GreenCreditResponse {
    private Long          id;
    private Long          userId;
    private String        userName;
    private Integer       totalCredits;
    private Integer       availableCredits;
    private Integer       redeemedCredits;
    private Double        co2SavedKg;
    private Integer       itemsRematched;
    private LocalDateTime lastUpdated;
    private LocalDateTime createdAt;
}

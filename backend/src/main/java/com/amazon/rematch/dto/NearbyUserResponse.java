package com.amazon.rematch.dto;

import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data @Builder
public class NearbyUserResponse {
    private Long         userId;
    private String       name;
    private String       city;
    private String       state;
    private String       country;
    private Double       distanceKm;
    private Integer      resolvedAtKm;
    private Double       interestScore;
    private Double       distanceScore;
    private Double       finalScore;
    private Integer      matchScore;
    private List<String> topCategories;
}

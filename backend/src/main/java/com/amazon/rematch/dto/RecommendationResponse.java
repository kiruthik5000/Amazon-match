package com.amazon.rematch.dto;

import com.amazon.rematch.entity.Recommendation.RecommendationStatus;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data @Builder
public class RecommendationResponse {
    private Long                 id;
    private Long                 userId;
    private ProductResponse      product;
    private Double               score;
    private Double               interestScore;
    private Double               distanceScore;
    private Double               distanceKm;
    private Integer              resolvedAtKm;   // 25 | 50 | 100 | null = nationwide
    private String               reason;
    private Integer              matchScore;
    private List<String>         matchReasons;
    private RecommendationStatus status;
    private LocalDateTime        createdAt;
}

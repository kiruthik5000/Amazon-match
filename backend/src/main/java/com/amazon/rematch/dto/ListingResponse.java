package com.amazon.rematch.dto;

import com.amazon.rematch.entity.Listing;
import com.amazon.rematch.entity.ListingStatus;
import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ListingResponse {

    private Long          id;
    private String        productName;
    private String        category;
    private String        brand;
    private String        purchaseYear;
    private BigDecimal    originalPrice;
    private BigDecimal    expectedPrice;
    private String        description;
    private ListingStatus status;
    private String        rejectionReason;
    private String        sellerId;

    // AI evaluation fields
    private String     conditionGrade;
    private Integer    confidenceScore;
    private Integer    lifeScore;
    private BigDecimal estimatedResaleValue;
    private String     aiSummary;

    private List<String> imageUrls;

    private LocalDateTime submittedAt;
    private LocalDateTime updatedAt;

    public static ListingResponse from(Listing l) {
        List<String> urls = l.getImages().stream()
            .sorted((a, b) -> Integer.compare(a.getDisplayOrder(), b.getDisplayOrder()))
            .map(img -> img.getImageUrl())
            .toList();

        return ListingResponse.builder()
            .id(l.getId())
            .productName(l.getProductName())
            .category(l.getCategory())
            .brand(l.getBrand())
            .purchaseYear(l.getPurchaseYear())
            .originalPrice(l.getOriginalPrice())
            .expectedPrice(l.getExpectedPrice())
            .description(l.getDescription())
            .status(l.getStatus())
            .rejectionReason(l.getRejectionReason())
            .sellerId(l.getSellerId())
            .conditionGrade(l.getConditionGrade())
            .confidenceScore(l.getConfidenceScore())
            .lifeScore(l.getLifeScore())
            .estimatedResaleValue(l.getEstimatedResaleValue())
            .aiSummary(l.getAiSummary())
            .imageUrls(urls)
            .submittedAt(l.getSubmittedAt())
            .updatedAt(l.getUpdatedAt())
            .build();
    }
}

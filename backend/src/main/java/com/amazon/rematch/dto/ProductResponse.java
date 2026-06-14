package com.amazon.rematch.dto;

import com.amazon.rematch.entity.Product.ConditionGrade;
import com.amazon.rematch.entity.Product.ConditionType;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
public class ProductResponse {
    private Long        id;
    private String      title;
    private String      description;
    private BigDecimal  originalPrice;
    private BigDecimal  rematchPrice;
    private Integer     discountPercent;
    private String      category;
    private String      imageUrl;
    private BigDecimal  rating;
    private Integer     reviewCount;
    private ConditionType  conditionType;
    private ConditionGrade conditionGrade;
    private Integer     lifeScore;
    private Boolean     aiVerified;
    private String      aiAssessmentSummary;
    private Boolean     available;
    private LocalDateTime listedAt;
    private Double      latitude;
    private Double      longitude;
    private String      city;
    private String      state;
    private String      country;
}

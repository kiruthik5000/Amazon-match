package com.amazon.rematch.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "products")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @NotNull
    @DecimalMin("0.0")
    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal originalPrice;

    @NotNull
    @DecimalMin("0.0")
    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal rematchPrice;

    @NotBlank
    private String category;

    private String imageUrl;

    @DecimalMin("0.0") @DecimalMax("5.0")
    @Column(precision = 2, scale = 1)
    private BigDecimal rating;

    @Min(0)
    private Integer reviewCount;

    // ReMatch-specific fields
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ConditionType conditionType;   // RETURNED | REFURBISHED

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ConditionGrade conditionGrade; // A | B | C | D

    @Min(0) @Max(100)
    @Column(nullable = false)
    private Integer lifeScore;

    @Column(nullable = false)
    private Boolean aiVerified;

    @Column(columnDefinition = "TEXT")
    private String aiAssessmentSummary;

    @Column(nullable = false)
    @Builder.Default
    private Boolean available = true;

    // Location of the product / seller
    private Double  latitude;
    private Double  longitude;
    private String  city;
    private String  state;
    private String  country;

    @Column(nullable = false, updatable = false)
    private LocalDateTime listedAt;

    @PrePersist
    protected void onCreate() {
        listedAt = LocalDateTime.now();
    }

    public enum ConditionType {
        RETURNED, REFURBISHED
    }

    public enum ConditionGrade {
        A, B, C, D
    }
}

package com.amazon.rematch.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(
    name = "recommendations",
    uniqueConstraints = @UniqueConstraint(columnNames = {"user_id", "product_id"})
)
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Recommendation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    /**
     * Final blended score 0.0–1.0  (70% interest + 30% distance).
     */
    @NotNull
    @DecimalMin("0.0") @DecimalMax("1.0")
    @Column(nullable = false, precision = 5, scale = 4)
    private BigDecimal score;

    /** 0.0–1.0 — how well the product category matches user interests */
    @Column(precision = 5, scale = 4)
    @Builder.Default
    private BigDecimal interestScore = BigDecimal.ZERO;

    /** 0.0–1.0 — proximity score (1.0 = same location, 0.0 = very far) */
    @Column(precision = 5, scale = 4)
    @Builder.Default
    private BigDecimal distanceScore = BigDecimal.ZERO;

    /** Actual distance in km between user and product origin */
    private Double distanceKm;

    /** Which expansion ring resolved this match: 25 | 50 | 100 | nationwide */
    private Integer resolvedAtKm;

    /** Human-readable reason */
    @Column(columnDefinition = "TEXT")
    private String reason;

    @Column(nullable = false)
    @Builder.Default
    private Integer matchScore = 0;

    @Column(columnDefinition = "TEXT")
    private String matchReasons;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private RecommendationStatus status = RecommendationStatus.ACTIVE;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }

    public enum RecommendationStatus {
        ACTIVE, DISMISSED, PURCHASED
    }
}

package com.amazon.rematch.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "user_interests",
       uniqueConstraints = @UniqueConstraint(columnNames = {"user_id", "category"}))
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class UserInterest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    /** Product category this interest applies to */
    @Column(nullable = false)
    private String category;

    /** Accumulated browse/click count — higher = stronger preference */
    @Column(nullable = false)
    @Builder.Default
    private Integer browseCount = 0;

    /** Explicit purchase count in this category */
    @Column(nullable = false)
    @Builder.Default
    private Integer purchaseCount = 0;

    /** Normalised weight 0.0–1.0, recomputed on each update */
    @Column(nullable = false)
    @Builder.Default
    private Double weight = 0.0;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt  = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    /** Record a browse event and bump weight */
    public void recordBrowse() {
        this.browseCount++;
        recalcWeight();
    }

    /** Record a purchase event (counts more than a browse) */
    public void recordPurchase() {
        this.purchaseCount++;
        recalcWeight();
    }

    private void recalcWeight() {
        // purchases worth 3× a browse
        double raw = browseCount + purchaseCount * 3.0;
        this.weight = Math.min(1.0, raw / 20.0);
    }
}

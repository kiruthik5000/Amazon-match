package com.amazon.rematch.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.Min;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "green_credits")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class GreenCredit {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    /** Total green credits earned across all ReMatch purchases. */
    @Min(0)
    @Column(nullable = false)
    @Builder.Default
    private Integer totalCredits = 0;

    /** Credits available for redemption (not yet spent). */
    @Min(0)
    @Column(nullable = false)
    @Builder.Default
    private Integer availableCredits = 0;

    /** Lifetime credits redeemed. */
    @Min(0)
    @Column(nullable = false)
    @Builder.Default
    private Integer redeemedCredits = 0;

    /** kg CO₂ saved — calculated from product life scores. */
    @Column(nullable = false)
    @Builder.Default
    private Double co2SavedKg = 0.0;

    /** Number of ReMatch purchases contributing to this account. */
    @Min(0)
    @Column(nullable = false)
    @Builder.Default
    private Integer itemsRematched = 0;

    private LocalDateTime lastUpdated;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        lastUpdated = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        lastUpdated = LocalDateTime.now();
    }

    /** Award credits and update eco stats after a ReMatch purchase. */
    public void award(int credits, double co2Kg) {
        this.totalCredits     += credits;
        this.availableCredits += credits;
        this.co2SavedKg       += co2Kg;
        this.itemsRematched   += 1;
    }

    /** Redeem credits (returns false if insufficient balance). */
    public boolean redeem(int credits) {
        if (this.availableCredits < credits) return false;
        this.availableCredits -= credits;
        this.redeemedCredits  += credits;
        return true;
    }
}

package com.amazon.rematch.service;

import com.amazon.rematch.dto.GreenCreditResponse;
import com.amazon.rematch.entity.GreenCredit;
import com.amazon.rematch.entity.User;
import com.amazon.rematch.exception.ResourceNotFoundException;
import com.amazon.rematch.repository.GreenCreditRepository;
import com.amazon.rematch.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class GreenCreditService {

    private final GreenCreditRepository greenCreditRepository;
    private final UserRepository        userRepository;

    // Credits awarded per life-score point above baseline (50)
    private static final double CREDITS_PER_LIFE_POINT = 0.5;
    // kg CO₂ saved per ReMatch purchase (average estimate)
    private static final double CO2_KG_PER_PURCHASE = 2.3;

    // ── Get credits for a user ────────────────────────────────────────────────

    public GreenCreditResponse getCreditsForUser(Long userId) {
        GreenCredit gc = greenCreditRepository.findByUserId(userId)
            .orElseThrow(() -> new ResourceNotFoundException(
                "GreenCredit account not found for user id: " + userId));
        return toResponse(gc);
    }

    // ── Get or create a credit account ───────────────────────────────────────

    @Transactional
    public GreenCreditResponse getOrCreateAccount(Long userId) {
        return greenCreditRepository.findByUserId(userId)
            .map(this::toResponse)
            .orElseGet(() -> {
                User user = userRepository.findById(userId)
                    .orElseThrow(() -> new ResourceNotFoundException("User", userId));
                GreenCredit gc = GreenCredit.builder().user(user).build();
                return toResponse(greenCreditRepository.save(gc));
            });
    }

    // ── Award credits after a ReMatch purchase ────────────────────────────────

    @Transactional
    public GreenCreditResponse awardCredits(Long userId, int lifeScore) {
        GreenCredit gc = greenCreditRepository.findByUserId(userId)
            .orElseGet(() -> {
                User user = userRepository.findById(userId)
                    .orElseThrow(() -> new ResourceNotFoundException("User", userId));
                return greenCreditRepository.save(GreenCredit.builder().user(user).build());
            });

        int    credits = calculateCredits(lifeScore);
        double co2Kg   = CO2_KG_PER_PURCHASE * ((double) lifeScore / 100);

        gc.award(credits, co2Kg);
        return toResponse(greenCreditRepository.save(gc));
    }

    // ── Redeem credits ────────────────────────────────────────────────────────

    @Transactional
    public GreenCreditResponse redeemCredits(Long userId, int credits) {
        GreenCredit gc = greenCreditRepository.findByUserId(userId)
            .orElseThrow(() -> new ResourceNotFoundException(
                "GreenCredit account not found for user id: " + userId));

        if (!gc.redeem(credits)) {
            throw new IllegalArgumentException(
                "Insufficient credits. Available: " + gc.getAvailableCredits());
        }
        return toResponse(greenCreditRepository.save(gc));
    }

    // ── Leaderboard ───────────────────────────────────────────────────────────

    public List<GreenCreditResponse> getLeaderboard() {
        return greenCreditRepository.findLeaderboard()
            .stream()
            .map(this::toResponse)
            .toList();
    }

    // ── Platform stats ────────────────────────────────────────────────────────

    public record PlatformStats(Double totalCo2SavedKg, Long totalCreditsIssued) {}

    public PlatformStats getPlatformStats() {
        return new PlatformStats(
            greenCreditRepository.sumTotalCo2Saved(),
            greenCreditRepository.sumTotalCreditsIssued()
        );
    }

    // ── Mapper ────────────────────────────────────────────────────────────────

    private GreenCreditResponse toResponse(GreenCredit gc) {
        return GreenCreditResponse.builder()
            .id(gc.getId())
            .userId(gc.getUser().getId())
            .userName(gc.getUser().getName())
            .totalCredits(gc.getTotalCredits())
            .availableCredits(gc.getAvailableCredits())
            .redeemedCredits(gc.getRedeemedCredits())
            .co2SavedKg(gc.getCo2SavedKg())
            .itemsRematched(gc.getItemsRematched())
            .lastUpdated(gc.getLastUpdated())
            .createdAt(gc.getCreatedAt())
            .build();
    }

    // ── Credit calculation ────────────────────────────────────────────────────

    private int calculateCredits(int lifeScore) {
        // Minimum 5 credits; extra credits scale with life score
        int base  = 5;
        int bonus = (int) Math.max(0, (lifeScore - 50) * CREDITS_PER_LIFE_POINT);
        return base + bonus;
    }
}

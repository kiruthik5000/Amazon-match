package com.amazon.rematch.service;

import org.springframework.stereotype.Service;

/**
 * Pure scoring utilities — no database access.
 *
 * Distance score formula:
 *   distanceScore = max(0,  1 - (distanceKm / maxRingKm))
 *
 * Final blended score:
 *   finalScore = 0.70 * interestScore + 0.30 * distanceScore
 */
@Service
public class LocationScoringService {

    /** Expansion rings in km */
    public static final int[] RINGS = {25, 50, 100};

    private static final double EARTH_RADIUS_KM = 6371.0;
    private static final double INTEREST_WEIGHT  = 0.70;
    private static final double DISTANCE_WEIGHT  = 0.30;

    // ── Haversine ─────────────────────────────────────────────────────────────

    public double haversine(double lat1, double lon1, double lat2, double lon2) {
        double dLat = Math.toRadians(lat2 - lat1);
        double dLon = Math.toRadians(lon2 - lon1);
        double a = Math.sin(dLat / 2) * Math.sin(dLat / 2)
                 + Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2))
                 * Math.sin(dLon / 2) * Math.sin(dLon / 2);
        return EARTH_RADIUS_KM * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    }

    // ── Distance score (0.0 – 1.0) ───────────────────────────────────────────

    /**
     * @param distanceKm  actual distance
     * @param ringKm      the ring at which this user was resolved (25/50/100/nationwide=5000)
     */
    public double distanceScore(double distanceKm, double ringKm) {
        return Math.max(0.0, 1.0 - (distanceKm / ringKm));
    }

    // ── Interest score (0.0 – 1.0) ───────────────────────────────────────────

    /**
     * Computes how much the product category matches the user's interest weights.
     *
     * @param productCategory  the category of the candidate product
     * @param userTopCategories ordered list of (category, weight) pairs
     */
    public double interestScore(String productCategory,
                                java.util.List<com.amazon.rematch.entity.UserInterest> userInterests) {
        if (userInterests == null || userInterests.isEmpty()) return 0.5; // neutral fallback
        double totalWeight = userInterests.stream().mapToDouble(i -> i.getWeight()).sum();
        if (totalWeight == 0) return 0.5;

        double matched = userInterests.stream()
                .filter(i -> i.getCategory().equalsIgnoreCase(productCategory))
                .mapToDouble(i -> i.getWeight())
                .findFirst()
                .orElse(0.0);

        // Normalise: matched weight as fraction of total, then scale up so
        // a user who only browses one category gets a high score for it
        double normalised = matched / totalWeight;
        // If there's no signal at all, give a neutral 0.3 rather than 0
        return normalised > 0 ? Math.min(1.0, normalised * 1.5) : 0.3;
    }

    // ── Final blended score ───────────────────────────────────────────────────

    public double finalScore(double interestScore, double distanceScore) {
        return round(INTEREST_WEIGHT * interestScore + DISTANCE_WEIGHT * distanceScore);
    }

    // ── Which ring? ───────────────────────────────────────────────────────────

    /** Returns the first ring radius (km) that contains this distance, or null for nationwide */
    public Integer resolvedRing(double distanceKm) {
        for (int ring : RINGS) {
            if (distanceKm <= ring) return ring;
        }
        return null; // nationwide
    }

    private double round(double v) {
        return Math.round(v * 10000.0) / 10000.0;
    }
}

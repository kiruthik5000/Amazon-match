package com.amazon.rematch.service;

import com.amazon.rematch.dto.BedrockExplanationResponse;
import com.amazon.rematch.dto.NearbyUserResponse;
import com.amazon.rematch.dto.RecommendationResponse;
import com.amazon.rematch.entity.*;
import com.amazon.rematch.entity.Recommendation.RecommendationStatus;
import com.amazon.rematch.exception.ResourceNotFoundException;
import com.amazon.rematch.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.*;
import java.util.stream.Collectors;
import java.util.stream.Stream;
import java.util.Set;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class RecommendationService {

    private final RecommendationRepository recommendationRepository;
    private final UserRepository           userRepository;
    private final ProductRepository        productRepository;
    private final UserInterestRepository   userInterestRepository;
    private final ProductService           productService;
    private final BedrockService           bedrockService;
    private final LocationScoringService   locationScoring;

    @Value("${bedrock.modelId}")
    private String modelId;

    // ── Constants ─────────────────────────────────────────────────────────────

    /** Nationwide ring distance used when no ring resolves */
    private static final double NATIONWIDE_KM = 5000.0;

    // ── Get nearby products for user (ring-expansion from user location) ──────

    /**
     * Finds products near the user using ring expansion: 25 → 50 → 100 → nationwide.
     * Scores each: 70% interest + 30% distance. Returns top N sorted by finalScore.
     */
    public List<RecommendationResponse> getNearbyProductsForUser(Long userId, int topN) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", userId));
        List<UserInterest> interests = userInterestRepository.findByUserIdOrderByWeightDesc(userId);

        List<Product> candidates;
        Integer resolvedRing = null;

        if (user.getLatitude() != null && user.getLongitude() != null) {
            candidates = null;
            for (int ring : LocationScoringService.RINGS) {
                List<Product> found = productRepository.findProductsWithinRadius(
                        user.getLatitude(), user.getLongitude(), ring);
                if (!found.isEmpty()) {
                    candidates    = found;
                    resolvedRing  = ring;
                    break;
                }
            }
            if (candidates == null || candidates.isEmpty()) {
                candidates = productRepository.findByAvailableTrueOrderByListedAtDesc();
            }
        } else {
            candidates = productRepository.findByAvailableTrueOrderByListedAtDesc();
        }

        final Integer ring = resolvedRing;
        return candidates.stream().map(product -> {
            double iScore = locationScoring.interestScore(product.getCategory(), interests);
            double dScore = 0.2;
            double distKm = -1;

            if (user.getLatitude() != null && user.getLongitude() != null
                    && product.getLatitude() != null && product.getLongitude() != null) {
                distKm = locationScoring.haversine(
                        user.getLatitude(), user.getLongitude(),
                        product.getLatitude(), product.getLongitude());
                double boundary = ring != null ? ring : NATIONWIDE_KM;
                dScore = locationScoring.distanceScore(distKm, boundary);
            }

            double finalScore = locationScoring.finalScore(iScore, dScore);
            int    matchPct   = (int) Math.round(finalScore * 100);
            List<String> reasons = buildMatchReasons(product, matchPct, iScore, dScore, distKm, ring, interests);

            Recommendation temp = Recommendation.builder()
                    .user(user).product(product)
                    .score(BigDecimal.valueOf(finalScore)).interestScore(BigDecimal.valueOf(iScore)).distanceScore(BigDecimal.valueOf(dScore))
                    .distanceKm(distKm > 0 ? distKm : null).resolvedAtKm(ring)
                    .matchScore(matchPct).matchReasons(String.join("|||", reasons))
                    .reason(reasons.isEmpty() ? "Nearby match" : reasons.get(0))
                    .build();
            return toResponse(temp);
        })
        .sorted(Comparator.comparingInt(RecommendationResponse::getMatchScore).reversed())
        .limit(topN)
        .toList();
    }

    // ── Get recommendations ───────────────────────────────────────────────────

    public List<RecommendationResponse> getRecommendationsForUser(Long userId) {
        assertUserExists(userId);
        List<RecommendationResponse> active = recommendationRepository
                .findByUserIdAndStatusWithProduct(userId, RecommendationStatus.ACTIVE)
                .stream()
                .map(this::toResponse)
                .toList();

        if (active.isEmpty()) {
            return generateRecommendations(userId);
        }

        List<Product> missingProducts = productRepository.findUnrecommendedForUser(userId);
        if (missingProducts.isEmpty()) {
            return active;
        }

        List<RecommendationResponse> extra = generateRecommendations(userId, missingProducts);
        return Stream.concat(active.stream(), extra.stream())
                .sorted(Comparator.comparingInt(RecommendationResponse::getMatchScore).reversed())
                .toList();
    }

    // ── Generate recommendations ──────────────────────────────────────────────

    @Transactional
    public List<RecommendationResponse> generateRecommendations(Long userId) {
        List<Product> candidates = productRepository.findUnrecommendedForUser(userId);
        return generateRecommendations(userId, candidates);
    }

    @Transactional
    public List<RecommendationResponse> generateRecommendations(Long userId, List<Product> candidates) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", userId));

        List<UserInterest> interests = userInterestRepository.findByUserIdOrderByWeightDesc(userId);

        // Pre-compute already-recommended product IDs
        Set<Long> alreadyRecommended = recommendationRepository
                .findByUserIdAndStatusWithProduct(userId, RecommendationStatus.ACTIVE)
                .stream().map(r -> r.getProduct().getId()).collect(Collectors.toSet());

        List<Recommendation> created = candidates.stream()
                .filter(p -> !alreadyRecommended.contains(p.getId()))
                .map(product -> {
                    double iScore = locationScoring.interestScore(product.getCategory(), interests);

                    double  dScore     = 0.2;  // default: nationwide
                    double  distKm     = -1;
                    Integer resolvedAt = null;

                    if (user.getLatitude() != null && user.getLongitude() != null
                            && product.getLatitude() != null && product.getLongitude() != null) {
                        distKm     = locationScoring.haversine(
                                user.getLatitude(), user.getLongitude(),
                                product.getLatitude(), product.getLongitude());
                        resolvedAt = locationScoring.resolvedRing(distKm);
                        // Distance score: 1.0 at 0 km, decays to 0 at the resolved ring boundary
                        double ringBoundary = resolvedAt != null ? resolvedAt : NATIONWIDE_KM;
                        dScore = locationScoring.distanceScore(distKm, ringBoundary);
                    }

                    double finalScore = locationScoring.finalScore(iScore, dScore);
                    int    matchPct   = (int) Math.round(finalScore * 100);

                    List<String> reasons = buildMatchReasons(product, matchPct, iScore, dScore, distKm, resolvedAt, interests);
                    String       reason  = buildReason(product, interests, distKm, resolvedAt);

                    return Recommendation.builder()
                            .user(user)
                            .product(product)
                            .score(BigDecimal.valueOf(finalScore))
                            .interestScore(BigDecimal.valueOf(iScore))
                            .distanceScore(BigDecimal.valueOf(dScore))
                            .distanceKm(distKm > 0 ? distKm : null)
                            .resolvedAtKm(resolvedAt)
                            .reason(reason)
                            .matchScore(matchPct)
                            .matchReasons(String.join("|||", reasons))
                            .build();
                }).toList();

        return recommendationRepository.saveAll(created).stream().map(this::toResponse).toList();
    }

    // ── Nearby users for a product ────────────────────────────────────────────

    /**
     * Returns scored list of nearby users for a given product.
     * Expands rings: 25 → 50 → 100 → nationwide.
     * Each user is scored: 70% interest match + 30% distance score.
     */
    public List<NearbyUserResponse> getNearbyUsers(Long productId, Long requestingUserId) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product", productId));

        User requester = userRepository.findById(requestingUserId)
                .orElseThrow(() -> new ResourceNotFoundException("User", requestingUserId));

        // If requesting user has no location, return all users with interest matching only
        if (requester.getLatitude() == null || requester.getLongitude() == null) {
            return scoreUsersNationwide(product, requestingUserId);
        }

        double srcLat = requester.getLatitude();
        double srcLon = requester.getLongitude();

        // Ring expansion
        for (int ring : LocationScoringService.RINGS) {
            List<User> candidates = userRepository.findUsersWithinRadius(srcLat, srcLon, ring, requestingUserId);
            if (!candidates.isEmpty()) {
                return scoreUsers(candidates, product, ring);
            }
        }

        // Fallback — nationwide
        return scoreUsersNationwide(product, requestingUserId);
    }

    private List<NearbyUserResponse> scoreUsers(List<User> users, Product product, int ringKm) {
        return users.stream().map(user -> {
            List<UserInterest> interests = userInterestRepository.findByUserIdOrderByWeightDesc(user.getId());
            List<String>       topCats   = interests.stream().map(UserInterest::getCategory).limit(3).toList();

            double iScore  = locationScoring.interestScore(product.getCategory(), interests);
            double distKm  = 0; // already within ring; exact dist not stored here — use ring as proxy
            double dScore  = locationScoring.distanceScore(distKm, ringKm);
            double fScore  = locationScoring.finalScore(iScore, dScore);

            return NearbyUserResponse.builder()
                    .userId(user.getId())
                    .name(user.getName())
                    .city(user.getCity())
                    .state(user.getState())
                    .country(user.getCountry())
                    .distanceKm(distKm)
                    .resolvedAtKm(ringKm)
                    .interestScore(round2(iScore))
                    .distanceScore(round2(dScore))
                    .finalScore(round2(fScore))
                    .matchScore((int) Math.round(fScore * 100))
                    .topCategories(topCats)
                    .build();
        })
        .sorted(Comparator.comparingDouble(NearbyUserResponse::getFinalScore).reversed())
        .toList();
    }

    private List<NearbyUserResponse> scoreUsersNationwide(Product product, long excludeUserId) {
        List<User> users = userRepository.findAllWithLocation(excludeUserId);
        // Also include users without location — interest score only
        List<User> all = userRepository.findAll().stream()
                .filter(u -> u.getId() != excludeUserId)
                .toList();

        return all.stream().map(user -> {
            List<UserInterest> interests = userInterestRepository.findByUserIdOrderByWeightDesc(user.getId());
            List<String>       topCats   = interests.stream().map(UserInterest::getCategory).limit(3).toList();

            double iScore = locationScoring.interestScore(product.getCategory(), interests);
            double dScore = 0.2; // minimal for nationwide
            double fScore = locationScoring.finalScore(iScore, dScore);

            return NearbyUserResponse.builder()
                    .userId(user.getId())
                    .name(user.getName())
                    .city(user.getCity())
                    .state(user.getState())
                    .country(user.getCountry())
                    .distanceKm(null)
                    .resolvedAtKm(null)
                    .interestScore(round2(iScore))
                    .distanceScore(round2(dScore))
                    .finalScore(round2(fScore))
                    .matchScore((int) Math.round(fScore * 100))
                    .topCategories(topCats)
                    .build();
        })
        .sorted(Comparator.comparingDouble(NearbyUserResponse::getFinalScore).reversed())
        .limit(50)
        .toList();
    }

    // ── Record a browse / purchase interest event ─────────────────────────────

    @Transactional
    public void recordBrowse(Long userId, String category) {
        if (category == null || category.isBlank()) return;
        UserInterest interest = userInterestRepository
                .findByUserIdAndCategory(userId, category)
                .orElseGet(() -> {
                    User u = userRepository.findById(userId).orElseThrow();
                    return UserInterest.builder().user(u).category(category).build();
                });
        interest.recordBrowse();
        userInterestRepository.save(interest);
    }

    @Transactional
    public void recordPurchase(Long userId, String category) {
        if (category == null || category.isBlank()) return;
        UserInterest interest = userInterestRepository
                .findByUserIdAndCategory(userId, category)
                .orElseGet(() -> {
                    User u = userRepository.findById(userId).orElseThrow();
                    return UserInterest.builder().user(u).category(category).build();
                });
        interest.recordPurchase();
        userInterestRepository.save(interest);
    }

    // ── Status update ─────────────────────────────────────────────────────────

    @Transactional
    public RecommendationResponse updateStatus(Long recommendationId, String statusStr) {
        Recommendation rec = recommendationRepository.findById(recommendationId)
                .orElseThrow(() -> new ResourceNotFoundException("Recommendation", recommendationId));
        try {
            rec.setStatus(RecommendationStatus.valueOf(statusStr.toUpperCase()));
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Invalid status. Use ACTIVE, DISMISSED, or PURCHASED.");
        }
        return toResponse(recommendationRepository.save(rec));
    }

    // ── Bedrock explanation ───────────────────────────────────────────────────

    public BedrockExplanationResponse explainRecommendation(Long recommendationId) {
        Recommendation rec = recommendationRepository.findById(recommendationId)
                .orElseThrow(() -> new ResourceNotFoundException("Recommendation", recommendationId));
        Product p = rec.getProduct();
        User    u = rec.getUser();

        String fallback = String.format(
                "Recommended for %s because %s is in Grade %s condition with a Life Score of %d/100.",
                u.getName(), p.getTitle(), p.getConditionGrade().name(), p.getLifeScore());

        String distanceNote = rec.getDistanceKm() != null
                ? String.format("The product origin is approximately %.0f km away (resolved within %s km ring).",
                        rec.getDistanceKm(), rec.getResolvedAtKm() != null ? rec.getResolvedAtKm() : "nationwide")
                : "Location data not available.";

        String prompt = String.format("""
                A customer named %s is shopping on Amazon ReMatch.
                Explain in 1-2 friendly sentences why this product is recommended:

                Product      : %s
                Category     : %s
                Condition    : Grade %s
                Life Score   : %d/100
                Price        : ₹%.2f (originally ₹%.2f)
                Interest Score: %.2f  |  Distance Score: %.2f  |  Final Score: %.2f
                Location note: %s

                Start with "Recommended because..." — be specific. No markdown.
                """,
                u.getName(), p.getTitle(), p.getCategory(),
                p.getConditionGrade().name(), p.getLifeScore(),
                p.getRematchPrice(), p.getOriginalPrice(),
                rec.getInterestScore().doubleValue(), rec.getDistanceScore().doubleValue(), rec.getScore().doubleValue(),
                distanceNote);

        String explanation = bedrockService.invoke(prompt, fallback);
        return BedrockExplanationResponse.builder()
                .type("RECOMMENDATION")
                .explanation(explanation)
                .modelId(modelId)
                .aiGenerated(!explanation.equals(fallback))
                .build();
    }

    // ── Mapper ────────────────────────────────────────────────────────────────

    private RecommendationResponse toResponse(Recommendation r) {
        List<String> reasons = (r.getMatchReasons() != null && !r.getMatchReasons().isBlank())
                ? Arrays.asList(r.getMatchReasons().split("\\|\\|\\|"))
                : List.of(r.getReason() != null ? r.getReason() : "Recommended for you");

        return RecommendationResponse.builder()
                .id(r.getId())
                .userId(r.getUser().getId())
                .product(productService.toResponse(r.getProduct()))
                .score(r.getScore() != null ? r.getScore().doubleValue() : null)
                .interestScore(r.getInterestScore() != null ? r.getInterestScore().doubleValue() : null)
                .distanceScore(r.getDistanceScore() != null ? r.getDistanceScore().doubleValue() : null)
                .distanceKm(r.getDistanceKm())
                .resolvedAtKm(r.getResolvedAtKm())
                .reason(r.getReason())
                .matchScore(r.getMatchScore() != null ? r.getMatchScore() : (int) Math.round(r.getScore().doubleValue() * 100))
                .matchReasons(reasons)
                .status(r.getStatus())
                .createdAt(r.getCreatedAt())
                .build();
    }

    // ── Match reason bullets ──────────────────────────────────────────────────

    private List<String> buildMatchReasons(Product p, int matchPct,
                                            double iScore, double dScore,
                                            double distKm, Integer resolvedAt,
                                            List<UserInterest> interests) {
        List<String> reasons = new ArrayList<>();

        // Browse / purchase signal
        UserInterest ui = interests.stream()
                .filter(i -> i.getCategory().equalsIgnoreCase(p.getCategory()))
                .findFirst().orElse(null);

        if (ui != null && ui.getPurchaseCount() > 0) {
            reasons.add("Recommended because you purchased similar " + p.getCategory() + " products");
        } else if (ui != null && ui.getBrowseCount() >= 5) {
            reasons.add("Recommended because you frequently browse " + p.getCategory());
        } else if (ui != null && ui.getBrowseCount() > 0) {
            reasons.add("Recommended because you browsed " + p.getCategory() + " items recently");
        } else if (iScore >= 0.4) {
            reasons.add("Aligns with your interest in " + p.getCategory());
        } else {
            reasons.add("Expanding recommendations to " + p.getCategory());
        }

        // Distance — specific km value
        if (distKm > 0 && resolvedAt != null) {
            reasons.add(String.format("Recommended because this item is available %.0f km away", distKm));
        } else if (distKm > 0) {
            reasons.add(String.format("Nationwide match — item is %.0f km away", distKm));
        } else {
            reasons.add("Available nationwide");
        }

        // Grade
        reasons.add(switch (p.getConditionGrade()) {
            case A -> "Grade A — like-new condition";
            case B -> "Grade B — good condition, minor wear";
            case C -> "Grade C — fair condition, visible wear";
            case D -> "Grade D — parts or repair use";
        });

        // Life score
        if (p.getLifeScore() >= 85) reasons.add("High Life Score " + p.getLifeScore() + "/100");

        // AI verified
        if (Boolean.TRUE.equals(p.getAiVerified())) reasons.add("AI-verified condition");

        // Discount
        if (p.getOriginalPrice() != null && p.getRematchPrice() != null) {
            int disc = p.getOriginalPrice()
                    .subtract(p.getRematchPrice())
                    .multiply(BigDecimal.valueOf(100))
                    .divide(p.getOriginalPrice(), RoundingMode.HALF_UP)
                    .intValue();
            if (disc >= 30) reasons.add(disc + "% off original price");
        }

        return reasons.subList(0, Math.min(reasons.size(), 4));
    }

    private String buildReason(Product p, List<UserInterest> interests, double distKm, Integer resolvedAt) {
        UserInterest ui = interests.stream()
                .filter(i -> i.getCategory().equalsIgnoreCase(p.getCategory()))
                .findFirst().orElse(null);

        if (ui != null && ui.getPurchaseCount() > 0)
            return "Recommended because you purchased similar " + p.getCategory() + " products";

        if (ui != null && ui.getBrowseCount() >= 5)
            return "Recommended because you frequently browse " + p.getCategory();

        if (distKm > 0)
            return String.format("Recommended because this item is available %.0f km away", distKm);

        return String.format(
                "Recommended because of %s condition (Grade %s) with a Life Score of %d/100",
                switch (p.getConditionGrade()) { case A -> "like-new"; case B -> "good"; case C -> "fair"; case D -> "parts"; },
                p.getConditionGrade().name(), p.getLifeScore());
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private void assertUserExists(Long userId) {
        if (!userRepository.existsById(userId))
            throw new ResourceNotFoundException("User", userId);
    }

    private double round2(double v) { return Math.round(v * 100.0) / 100.0; }
}

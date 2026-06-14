package com.amazon.rematch.controller;

import com.amazon.rematch.dto.*;
import com.amazon.rematch.repository.UserRepository;
import com.amazon.rematch.service.RecommendationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/recommendations")
public class RecommendationController {

    private final RecommendationService recommendationService;
    private final UserRepository        userRepository;

    /** GET /recommendations/{userId} — active recommendations, highest score first */
    @GetMapping("/{userId}")
    public ResponseEntity<ApiResponse<List<RecommendationResponse>>> getRecommendations(
            @PathVariable Long userId) {
        return ResponseEntity.ok(ApiResponse.ok(
                recommendationService.getRecommendationsForUser(userId)));
    }

    /**
     * GET /recommendations/{userId}/nearby-products?top=10
     * Ring-expansion: finds products near the user (25 → 50 → 100 → nationwide).
     * Each product scored: 70% interest + 30% distance.
     */
    @GetMapping("/{userId}/nearby-products")
    public ResponseEntity<ApiResponse<List<RecommendationResponse>>> getNearbyProducts(
            @PathVariable Long userId,
            @RequestParam(defaultValue = "10") int top) {
        return ResponseEntity.ok(ApiResponse.ok(
                recommendationService.getNearbyProductsForUser(userId, top)));
    }

    /** POST /recommendations/{userId}/generate — score + persist fresh recommendations */
    @PostMapping("/{userId}/generate")
    public ResponseEntity<ApiResponse<List<RecommendationResponse>>> generate(
            @PathVariable Long userId) {
        return ResponseEntity.ok(ApiResponse.ok(
                "Recommendations generated successfully.",
                recommendationService.generateRecommendations(userId)));
    }

    /** PATCH /recommendations/{id}/status — body: "ACTIVE" | "DISMISSED" | "PURCHASED" */
    @PatchMapping("/{id}/status")
    public ResponseEntity<ApiResponse<RecommendationResponse>> updateStatus(
            @PathVariable Long id,
            @RequestBody String status) {
        return ResponseEntity.ok(ApiResponse.ok(
                recommendationService.updateStatus(id, status.trim().replace("\"", ""))));
    }

    /**
     * GET /recommendations/nearby-users/{productId}
     * Ring expansion: 25 → 50 → 100 → nationwide.
     * Each user scored: 70 % interest + 30 % distance.
     */
    @GetMapping("/nearby-users/{productId}")
    public ResponseEntity<ApiResponse<List<NearbyUserResponse>>> getNearbyUsers(
            @PathVariable Long productId,
            @AuthenticationPrincipal UserDetails userDetails) {
        Long userId = resolveUserId(userDetails);
        return ResponseEntity.ok(ApiResponse.ok(
                recommendationService.getNearbyUsers(productId, userId)));
    }

    /** POST /recommendations/browse?userId=&category= — record a browse event */
    @PostMapping("/browse")
    public ResponseEntity<ApiResponse<Void>> recordBrowse(
            @RequestParam Long userId,
            @RequestParam String category) {
        recommendationService.recordBrowse(userId, category);
        return ResponseEntity.ok(ApiResponse.ok(null));
    }

    /** POST /recommendations/purchase?userId=&category= — record a purchase (3× weight) */
    @PostMapping("/purchase")
    public ResponseEntity<ApiResponse<Void>> recordPurchase(
            @RequestParam Long userId,
            @RequestParam String category) {
        recommendationService.recordPurchase(userId, category);
        return ResponseEntity.ok(ApiResponse.ok(null));
    }

    /** GET /recommendations/{id}/explain — Bedrock AI explanation for one recommendation */
    @GetMapping("/{id}/explain")
    public ResponseEntity<ApiResponse<BedrockExplanationResponse>> explain(
            @PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(
                recommendationService.explainRecommendation(id)));
    }

    // ── Helper ────────────────────────────────────────────────────────────────

    private Long resolveUserId(UserDetails userDetails) {
        return userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new IllegalStateException("Authenticated user not found"))
                .getId();
    }
}

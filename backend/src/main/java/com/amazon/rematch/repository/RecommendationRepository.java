package com.amazon.rematch.repository;

import com.amazon.rematch.entity.Recommendation;
import com.amazon.rematch.entity.Recommendation.RecommendationStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface RecommendationRepository extends JpaRepository<Recommendation, Long> {

    // All active recommendations for a user, highest score first
    List<Recommendation> findByUserIdAndStatusOrderByScoreDesc(Long userId, RecommendationStatus status);

    // All recommendations for a user regardless of status
    List<Recommendation> findByUserIdOrderByScoreDesc(Long userId);

    // Check for an existing recommendation pair
    Optional<Recommendation> findByUserIdAndProductId(Long userId, Long productId);

    // Count active recommendations per user
    long countByUserIdAndStatus(Long userId, RecommendationStatus status);

    // Top N recommendations across all users (admin / analytics)
    @Query("""
        SELECT r FROM Recommendation r
        WHERE r.status = 'ACTIVE'
        ORDER BY r.score DESC
        """)
    List<Recommendation> findTopRecommendations();

    // Fetch with product eagerly to avoid N+1
    @Query("""
        SELECT r FROM Recommendation r
        JOIN FETCH r.product p
        WHERE r.user.id = :userId
          AND r.status = :status
        ORDER BY r.score DESC
        """)
    List<Recommendation> findByUserIdAndStatusWithProduct(
        @Param("userId") Long userId,
        @Param("status") RecommendationStatus status
    );
}

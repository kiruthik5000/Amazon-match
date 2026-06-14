package com.amazon.rematch.repository;

import com.amazon.rematch.entity.Product;
import com.amazon.rematch.entity.Product.ConditionGrade;
import com.amazon.rematch.entity.Product.ConditionType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ProductRepository extends JpaRepository<Product, Long> {

    // All available ReMatch products (returned + refurbished)
    List<Product> findByAvailableTrueOrderByListedAtDesc();

    // By condition type
    List<Product> findByConditionTypeAndAvailableTrue(ConditionType conditionType);

    // By grade
    List<Product> findByConditionGradeAndAvailableTrue(ConditionGrade grade);

    // By category (exact, case-insensitive)
    List<Product> findByCategoryIgnoreCaseAndAvailableTrue(String category);

    // By category + optional keyword search
    @Query("""
        SELECT p FROM Product p
        WHERE p.available = true
          AND LOWER(p.category) = LOWER(:category)
          AND (:keyword IS NULL OR :keyword = ''
               OR LOWER(p.title) LIKE LOWER(CONCAT('%', :keyword, '%'))
               OR LOWER(p.description) LIKE LOWER(CONCAT('%', :keyword, '%')))
        ORDER BY p.listedAt DESC
        """)
    List<Product> findByCategoryAndKeyword(@Param("category") String category,
                                           @Param("keyword") String keyword);

    // All distinct categories
    @Query("SELECT DISTINCT p.category FROM Product p WHERE p.available = true ORDER BY p.category")
    List<String> findDistinctCategories();

    // AI verified only
    List<Product> findByAiVerifiedTrueAndAvailableTrue();

    // Full-text search on title + description
    @Query("""
        SELECT p FROM Product p
        WHERE p.available = true
          AND (LOWER(p.title) LIKE LOWER(CONCAT('%', :keyword, '%'))
            OR LOWER(p.description) LIKE LOWER(CONCAT('%', :keyword, '%')))
        ORDER BY p.listedAt DESC
        """)
    List<Product> searchByKeyword(@Param("keyword") String keyword);

    // Top products by life score
    @Query("""
        SELECT p FROM Product p
        WHERE p.available = true
        ORDER BY p.lifeScore DESC
        """)
    List<Product> findTopByLifeScore();

    // Products eligible for a user's recommendations (not yet recommended)
    @Query("""
        SELECT p FROM Product p
        WHERE p.available = true
          AND p.id NOT IN (
              SELECT r.product.id FROM Recommendation r WHERE r.user.id = :userId
          )
        ORDER BY p.lifeScore DESC
        """)
    List<Product> findUnrecommendedForUser(@Param("userId") Long userId);

    /**
     * Available products within :radiusKm of a coordinate (Haversine, MySQL native).
     * Used by the ring-expansion recommendation engine.
     */
    @Query(value = """
        SELECT p.* FROM products p
        WHERE p.available = true
          AND p.latitude  IS NOT NULL
          AND p.longitude IS NOT NULL
          AND (6371 * ACOS(
                 COS(RADIANS(:lat)) * COS(RADIANS(p.latitude))
               * COS(RADIANS(p.longitude) - RADIANS(:lon))
               + SIN(RADIANS(:lat)) * SIN(RADIANS(p.latitude))
               )) <= :radiusKm
        ORDER BY (6371 * ACOS(
                 COS(RADIANS(:lat)) * COS(RADIANS(p.latitude))
               * COS(RADIANS(p.longitude) - RADIANS(:lon))
               + SIN(RADIANS(:lat)) * SIN(RADIANS(p.latitude))
               )) ASC
        """, nativeQuery = true)
    List<Product> findProductsWithinRadius(
        @Param("lat")      double lat,
        @Param("lon")      double lon,
        @Param("radiusKm") double radiusKm
    );
}

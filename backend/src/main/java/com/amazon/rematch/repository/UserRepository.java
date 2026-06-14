package com.amazon.rematch.repository;

import com.amazon.rematch.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    boolean existsByEmail(String email);

    /**
     * Haversine great-circle distance in km, returns users within :radiusKm.
     * Excludes users without location data and the requester themselves.
     */
    @Query(value = """
        SELECT u.* FROM users u
        WHERE u.id <> :excludeUserId
          AND u.latitude  IS NOT NULL
          AND u.longitude IS NOT NULL
          AND (6371 * ACOS(
                 COS(RADIANS(:lat)) * COS(RADIANS(u.latitude))
               * COS(RADIANS(u.longitude) - RADIANS(:lon))
               + SIN(RADIANS(:lat)) * SIN(RADIANS(u.latitude))
               )) <= :radiusKm
        ORDER BY (6371 * ACOS(
                 COS(RADIANS(:lat)) * COS(RADIANS(u.latitude))
               * COS(RADIANS(u.longitude) - RADIANS(:lon))
               + SIN(RADIANS(:lat)) * SIN(RADIANS(u.latitude))
               )) ASC
        """, nativeQuery = true)
    List<User> findUsersWithinRadius(
        @Param("lat")           double lat,
        @Param("lon")           double lon,
        @Param("radiusKm")      double radiusKm,
        @Param("excludeUserId") long   excludeUserId
    );

    /** All users that have location data */
    @Query("SELECT u FROM User u WHERE u.latitude IS NOT NULL AND u.longitude IS NOT NULL AND u.id <> :excludeUserId")
    List<User> findAllWithLocation(@Param("excludeUserId") long excludeUserId);
}

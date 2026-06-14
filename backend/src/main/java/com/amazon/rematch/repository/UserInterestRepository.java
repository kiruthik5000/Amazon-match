package com.amazon.rematch.repository;

import com.amazon.rematch.entity.UserInterest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface UserInterestRepository extends JpaRepository<UserInterest, Long> {

    List<UserInterest> findByUserIdOrderByWeightDesc(Long userId);

    Optional<UserInterest> findByUserIdAndCategory(Long userId, String category);

    /** All distinct categories the user has shown interest in, strongest first */
    @Query("SELECT ui.category FROM UserInterest ui WHERE ui.user.id = :userId ORDER BY ui.weight DESC")
    List<String> findTopCategoriesByUserId(@Param("userId") Long userId);
}

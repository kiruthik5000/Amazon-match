package com.amazon.rematch.repository;

import com.amazon.rematch.entity.GreenCredit;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface GreenCreditRepository extends JpaRepository<GreenCredit, Long> {

    Optional<GreenCredit> findByUserId(Long userId);

    boolean existsByUserId(Long userId);

    // Leaderboard: top eco contributors
    @Query("""
        SELECT g FROM GreenCredit g
        ORDER BY g.co2SavedKg DESC
        """)
    List<GreenCredit> findLeaderboard();

    // Total platform-wide CO₂ saved
    @Query("SELECT COALESCE(SUM(g.co2SavedKg), 0) FROM GreenCredit g")
    Double sumTotalCo2Saved();

    // Total platform-wide credits issued
    @Query("SELECT COALESCE(SUM(g.totalCredits), 0) FROM GreenCredit g")
    Long sumTotalCreditsIssued();
}

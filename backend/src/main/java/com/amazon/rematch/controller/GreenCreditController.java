package com.amazon.rematch.controller;

import com.amazon.rematch.dto.ApiResponse;
import com.amazon.rematch.dto.AwardCreditsRequest;
import com.amazon.rematch.dto.GreenCreditResponse;
import com.amazon.rematch.entity.GreenCredit;
import com.amazon.rematch.exception.ResourceNotFoundException;
import com.amazon.rematch.repository.GreenCreditRepository;
import com.amazon.rematch.service.BadgeService;
import com.amazon.rematch.service.GreenCreditService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/credits")
@RequiredArgsConstructor
public class GreenCreditController {

    private final GreenCreditService      greenCreditService;
    private final GreenCreditRepository   greenCreditRepository;
    private final BadgeService            badgeService;

    /** GET /credits/{userId} — fetch credits + badges for a user */
    @GetMapping("/{userId}")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getCredits(@PathVariable Long userId) {
        GreenCreditResponse credits = greenCreditService.getOrCreateAccount(userId);
        GreenCredit gc = greenCreditRepository.findByUserId(userId)
            .orElseThrow(() -> new ResourceNotFoundException("GreenCredit", userId));
        List<BadgeService.Badge> badges = badgeService.computeBadges(gc);

        return ResponseEntity.ok(ApiResponse.ok(Map.of(
            "credits", credits,
            "badges",  badges
        )));
    }

    /** POST /credits/award — award credits after a ReMatch purchase */
    @PostMapping("/award")
    public ResponseEntity<ApiResponse<GreenCreditResponse>> awardCredits(
        @Valid @RequestBody AwardCreditsRequest req
    ) {
        GreenCreditResponse response = greenCreditService.awardCredits(req.userId(), req.lifeScore());
        return ResponseEntity.ok(ApiResponse.ok("Credits awarded successfully", response));
    }

    /** GET /credits/leaderboard — top eco contributors */
    @GetMapping("/leaderboard")
    public ResponseEntity<ApiResponse<List<GreenCreditResponse>>> getLeaderboard() {
        return ResponseEntity.ok(ApiResponse.ok(greenCreditService.getLeaderboard()));
    }
}

package com.amazon.rematch.controller;

import com.amazon.rematch.dto.BedrockExplanationResponse;
import com.amazon.rematch.dto.LifeScoreRequest;
import com.amazon.rematch.dto.LifeScoreResponse;
import com.amazon.rematch.service.LifeScoreService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/lifescore")
public class LifeScoreController {

    private final LifeScoreService lifeScoreService;

    public LifeScoreController(LifeScoreService lifeScoreService) {
        this.lifeScoreService = lifeScoreService;
    }

    @PostMapping("/calculate")
    public ResponseEntity<LifeScoreResponse> calculate(@Valid @RequestBody LifeScoreRequest request) {
        return ResponseEntity.ok(lifeScoreService.calculate(request));
    }

    @PostMapping("/explain")
    public ResponseEntity<BedrockExplanationResponse> explain(@Valid @RequestBody LifeScoreRequest request) {
        return ResponseEntity.ok(lifeScoreService.explainLifeScore(request));
    }
}

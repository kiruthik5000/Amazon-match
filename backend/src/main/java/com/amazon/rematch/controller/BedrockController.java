package com.amazon.rematch.controller;

import com.amazon.rematch.dto.ApiResponse;
import com.amazon.rematch.dto.BedrockExplanationResponse;
import com.amazon.rematch.service.ConditionExplanationService;
import com.amazon.rematch.service.RecommendationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
@RequestMapping("/ai/explain")
public class BedrockController {

    private final RecommendationService      recommendationService;
    private final ConditionExplanationService conditionExplanationService;

    /**
     * GET /ai/explain/recommendation/{id}
     * Returns a Bedrock-generated explanation for why a recommendation was made.
     * Example: "Recommended because you frequently browse electronics and this
     *           Grade A Sony headset offers 43% off with a Life Score of 94/100."
     */
    @GetMapping("/recommendation/{id}")
    public ResponseEntity<ApiResponse<BedrockExplanationResponse>> explainRecommendation(
        @PathVariable Long id
    ) {
        return ResponseEntity.ok(
            ApiResponse.ok(recommendationService.explainRecommendation(id))
        );
    }

    /**
     * GET /ai/explain/condition/{productId}
     * Returns a Bedrock-generated condition assessment explanation for a product.
     * Example: "This refurbished Sony WH-1000XM4 is in Grade A condition,
     *           meaning it looks and performs like new with no visible defects."
     */
    @GetMapping("/condition/{productId}")
    public ResponseEntity<ApiResponse<BedrockExplanationResponse>> explainCondition(
        @PathVariable Long productId
    ) {
        return ResponseEntity.ok(
            ApiResponse.ok(conditionExplanationService.explain(productId))
        );
    }
}

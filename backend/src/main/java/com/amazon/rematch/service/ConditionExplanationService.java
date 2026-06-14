package com.amazon.rematch.service;

import com.amazon.rematch.dto.BedrockExplanationResponse;
import com.amazon.rematch.entity.Product;
import com.amazon.rematch.exception.ResourceNotFoundException;
import com.amazon.rematch.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class ConditionExplanationService {

    private final ProductRepository productRepository;
    private final BedrockService    bedrockService;

    @Value("${bedrock.modelId}")
    private String modelId;

    public BedrockExplanationResponse explain(Long productId) {
        Product p = productRepository.findById(productId)
            .orElseThrow(() -> new ResourceNotFoundException("Product", productId));

        String fallback = buildFallback(p);

        String prompt = String.format(
            """
            A product has been inspected on Amazon ReMatch with these results:

            Product: %s
            Category: %s
            Condition Type: %s
            Condition Grade: %s (A=Like New, B=Good, C=Fair, D=Poor)
            Life Score: %d/100
            AI Verified: %s

            Write a 1-2 sentence customer-facing explanation of this product's condition
            that helps a buyer understand what grade %s means for this specific product.
            Be reassuring but honest. Start with the product name.
            """,
            p.getTitle(),
            p.getCategory(),
            p.getConditionType().name(),
            p.getConditionGrade().name(),
            p.getLifeScore(),
            p.getAiVerified() ? "Yes" : "No",
            p.getConditionGrade().name()
        );

        String explanation = bedrockService.invoke(prompt, fallback);

        return BedrockExplanationResponse.builder()
            .type("CONDITION")
            .explanation(explanation)
            .modelId(modelId)
            .aiGenerated(!explanation.equals(fallback))
            .build();
    }

    private String buildFallback(Product p) {
        String gradeLabel = switch (p.getConditionGrade()) {
            case A -> "like-new condition with no visible defects";
            case B -> "good condition with minor cosmetic wear";
            case C -> "fair condition with noticeable signs of use";
            case D -> "heavily used condition, suitable for parts or repair";
        };
        return String.format(
            "%s is in %s, with a Life Score of %d/100%s.",
            p.getTitle(), gradeLabel, p.getLifeScore(),
            p.getAiVerified() ? " and has been AI-verified" : ""
        );
    }
}

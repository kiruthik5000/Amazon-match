package com.amazon.rematch.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class BedrockExplanationResponse {
    private String type;          // RECOMMENDATION | LIFE_SCORE | CONDITION
    private String explanation;   // Claude-generated natural language text
    private String modelId;       // which Bedrock model was used
    private boolean aiGenerated;  // false when fallback was used
}

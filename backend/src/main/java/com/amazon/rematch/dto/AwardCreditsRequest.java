package com.amazon.rematch.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public record AwardCreditsRequest(

    @NotNull(message = "userId is required")
    Long userId,

    @NotNull(message = "lifeScore is required")
    @Min(value = 0,   message = "lifeScore must be 0–100")
    @Max(value = 100, message = "lifeScore must be 0–100")
    Integer lifeScore,

    String productTitle    // optional — stored for audit/display
) {}

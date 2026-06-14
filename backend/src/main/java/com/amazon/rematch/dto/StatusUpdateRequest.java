package com.amazon.rematch.dto;

import com.amazon.rematch.entity.ListingStatus;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class StatusUpdateRequest {

    @NotNull(message = "Status is required")
    private ListingStatus status;

    // required when status is REJECTED
    private String rejectionReason;
}

package com.amazon.rematch.controller;

import com.amazon.rematch.dto.ApiResponse;
import com.amazon.rematch.dto.ListingRequest;
import com.amazon.rematch.dto.ListingResponse;
import com.amazon.rematch.dto.StatusUpdateRequest;
import com.amazon.rematch.entity.ListingStatus;
import com.amazon.rematch.service.ListingService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/rematch/listings")
@RequiredArgsConstructor
public class ListingController {

    private final ListingService listingService;

    // ── POST /rematch/listings ─────────────────────────────────────────────────
    // Accepts multipart/form-data: listing fields + up to 5 images
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<ListingResponse>> createListing(
        @Valid @ModelAttribute ListingRequest request,
        @RequestPart(value = "images") List<MultipartFile> images
    ) {
        ListingResponse response = listingService.createListing(request, images);
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(ApiResponse.ok("Listing submitted successfully", response));
    }

    // ── GET /rematch/listings ──────────────────────────────────────────────────
    // Optional ?status=PENDING_REVIEW|APPROVED|LISTED|SOLD|REJECTED filter
    // Optional ?sellerId=<id> filter (returns only that seller's listings)
    @GetMapping
    public ResponseEntity<ApiResponse<List<ListingResponse>>> getAllListings(
        @RequestParam(required = false) ListingStatus status,
        @RequestParam(required = false) String sellerId
    ) {
        return ResponseEntity.ok(ApiResponse.ok(listingService.getAllListings(status, sellerId)));
    }

    // ── GET /rematch/listings/{id} ─────────────────────────────────────────────
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ListingResponse>> getListingById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(listingService.getListingById(id)));
    }

    // ── PUT /rematch/listings/{id}/status ─────────────────────────────────────
    @PutMapping("/{id}/status")
    public ResponseEntity<ApiResponse<ListingResponse>> updateStatus(
        @PathVariable Long id,
        @Valid @RequestBody StatusUpdateRequest request
    ) {
        return ResponseEntity.ok(
            ApiResponse.ok("Listing status updated to " + request.getStatus(), listingService.updateStatus(id, request))
        );
    }
}

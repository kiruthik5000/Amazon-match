package com.amazon.rematch.service;

import com.amazon.rematch.dto.AiEvaluationResult;
import com.amazon.rematch.dto.ListingRequest;
import com.amazon.rematch.dto.ListingResponse;
import com.amazon.rematch.dto.StatusUpdateRequest;
import com.amazon.rematch.entity.*;
import com.amazon.rematch.entity.ListingStatus;
import com.amazon.rematch.entity.Product.ConditionGrade;
import com.amazon.rematch.entity.Product.ConditionType;
import com.amazon.rematch.exception.ResourceNotFoundException;
import com.amazon.rematch.repository.ListingRepository;
import com.amazon.rematch.repository.ProductRepository;
import com.amazon.rematch.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Slf4j
@Service
@RequiredArgsConstructor
public class ListingService {

    private final ListingRepository       listingRepository;
    private final ImageStorageService      imageStorageService;
    private final ConditionAnalysisService conditionAnalysisService;
    private final ProductRepository        productRepository;
    private final UserRepository           userRepository;

    // ── POST /rematch/listings ─────────────────────────────────────────────────

    @Transactional
    public ListingResponse createListing(ListingRequest request, List<MultipartFile> images) {
        if (images == null || images.isEmpty())
            throw new IllegalArgumentException("At least one product image is required");
        if (images.size() > 5)
            throw new IllegalArgumentException("Maximum 5 images are allowed per listing");

        Listing listing = Listing.builder()
            .productName(request.getProductName())
            .category(request.getCategory())
            .brand(request.getBrand())
            .purchaseYear(request.getPurchaseYear())
            .originalPrice(request.getOriginalPrice())
            .expectedPrice(request.getExpectedPrice())
            .description(request.getDescription())
            .sellerId(request.getSellerId())
            .status(ListingStatus.LISTED)
            .build();

        // 1 — persist listing to get a DB id
        Listing saved = listingRepository.save(listing);

        // 2 — store images on disk and attach to listing
        List<MultipartFile> validImages = new java.util.ArrayList<>();
        for (int i = 0; i < images.size(); i++) {
            MultipartFile file = images.get(i);
            if (file == null || file.isEmpty()) continue;
            try {
                String url = imageStorageService.store(file);
                ListingImage img = ListingImage.builder()
                    .imageUrl(url)
                    .displayOrder(i)
                    .build();
                saved.addImage(img);
                validImages.add(file);
            } catch (IOException ex) {
                log.error("Failed to store image {}: {}", file.getOriginalFilename(), ex.getMessage());
                throw new RuntimeException("Failed to store image: " + file.getOriginalFilename(), ex);
            }
        }
        listingRepository.save(saved); // flush image records

        // 3 — send images to FastAPI condition analyzer and persist AI results
        try {
            AiEvaluationResult ai = conditionAnalysisService.evaluate(validImages, saved.getOriginalPrice());
            saved.setConditionGrade(ai.getConditionGrade());
            saved.setConfidenceScore(ai.getConfidenceScore());
            saved.setLifeScore(ai.getLifeScore());
            saved.setEstimatedResaleValue(ai.getEstimatedResaleValue());
            saved.setAiSummary(ai.getAiSummary());
            log.info("AI evaluation stored for listing {}: grade={}, lifeScore={}, resaleValue={}",
                saved.getId(), ai.getConditionGrade(), ai.getLifeScore(), ai.getEstimatedResaleValue());
        } catch (Exception ex) {
            // Non-fatal: listing is saved without AI data; can be re-evaluated later
            log.error("Condition analysis failed for listing {}: {}", saved.getId(), ex.getMessage());
        }

        convertListingToProduct(saved);
        return ListingResponse.from(listingRepository.save(saved));
    }

    // ── GET /rematch/listings ──────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public List<ListingResponse> getAllListings(ListingStatus status, String sellerId) {
        List<Listing> listings;
        if (status != null && sellerId != null) {
            listings = listingRepository.findByStatusAndSellerIdOrderBySubmittedAtDesc(status, sellerId);
        } else if (status != null) {
            listings = listingRepository.findByStatusOrderBySubmittedAtDesc(status);
        } else if (sellerId != null) {
            listings = listingRepository.findBySellerIdOrderBySubmittedAtDesc(sellerId);
        } else {
            listings = listingRepository.findAllByOrderBySubmittedAtDesc();
        }
        return listings.stream().map(ListingResponse::from).toList();
    }

    // ── GET /rematch/listings/{id} ─────────────────────────────────────────────

    @Transactional(readOnly = true)
    public ListingResponse getListingById(Long id) {
        Listing listing = findOrThrow(id);
        return ListingResponse.from(listing);
    }

    // ── PUT /rematch/listings/{id}/status ─────────────────────────────────────

    @Transactional
    public ListingResponse updateStatus(Long id, StatusUpdateRequest request) {
        Listing listing = findOrThrow(id);
        ListingStatus previousStatus = listing.getStatus();

        if (request.getStatus() == ListingStatus.REJECTED
                && (request.getRejectionReason() == null || request.getRejectionReason().isBlank()))
            throw new IllegalArgumentException("Rejection reason is required when rejecting a listing");

        listing.setStatus(request.getStatus());

        if (request.getStatus() == ListingStatus.REJECTED)
            listing.setRejectionReason(request.getRejectionReason());
        else
            listing.setRejectionReason(null);

        // Auto-convert to Product when approved so it appears in recommendations
        if (request.getStatus() == ListingStatus.APPROVED
                && previousStatus != ListingStatus.LISTED) {
            convertListingToProduct(listing);
        }

        log.info("Listing {} status updated to {}", id, request.getStatus());
        return ListingResponse.from(listingRepository.save(listing));
    }

    // ── Helper ────────────────────────────────────────────────────────────────

    private Listing findOrThrow(Long id) {
        return listingRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Listing not found with id: " + id));
    }

    private void convertListingToProduct(Listing listing) {
        try {
            // Resolve seller location from User table if available
            Double lat = null, lon = null;
            String city = null, state = null, country = "India";
            if (listing.getSellerId() != null && !listing.getSellerId().isBlank()) {
                String sellerId = listing.getSellerId().trim();
                Optional<User> userOpt = Optional.empty();
                try {
                    long sellerIdLong = Long.parseLong(sellerId);
                    userOpt = userRepository.findById(sellerIdLong);
                } catch (NumberFormatException ignored) {
                    userOpt = Optional.empty();
                }
                if (userOpt.isEmpty()) {
                    userOpt = userRepository.findByEmail(sellerId);
                }
                if (userOpt.isPresent()) {
                    User u = userOpt.get();
                    lat = u.getLatitude(); lon = u.getLongitude();
                    city = u.getCity(); state = u.getState(); country = u.getCountry();
                }
            }

            String imageUrl = listing.getImages().isEmpty()
                ? null : listing.getImages().get(0).getImageUrl();

            BigDecimal rematchPrice = listing.getEstimatedResaleValue() != null
                ? listing.getEstimatedResaleValue() : listing.getExpectedPrice();

            ConditionGrade grade = ConditionGrade.B;
            if (listing.getConditionGrade() != null) {
                try { grade = ConditionGrade.valueOf(listing.getConditionGrade()); } catch (Exception ignored) {}
            }

            Product product = new Product();
            product.setTitle(listing.getProductName());
            product.setDescription(listing.getDescription());
            product.setOriginalPrice(listing.getOriginalPrice());
            product.setRematchPrice(rematchPrice);
            product.setCategory(listing.getCategory());
            product.setImageUrl(imageUrl);
            product.setConditionType(ConditionType.RETURNED);
            product.setConditionGrade(grade);
            product.setLifeScore(listing.getLifeScore() != null ? listing.getLifeScore() : 70);
            product.setAiVerified(listing.getConditionGrade() != null);
            product.setAiAssessmentSummary(listing.getAiSummary());
            product.setAvailable(true);
            product.setLatitude(lat); product.setLongitude(lon);
            product.setCity(city); product.setState(state); product.setCountry(country);
            productRepository.save(product);
            log.info("Listing {} converted to Product for seller {}", listing.getId(), listing.getSellerId());
        } catch (Exception e) {
            log.error("Failed to convert listing {} to product: {}", listing.getId(), e.getMessage());
        }
    }
}

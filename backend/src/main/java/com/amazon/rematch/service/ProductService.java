package com.amazon.rematch.service;

import com.amazon.rematch.dto.PagedResponse;
import com.amazon.rematch.dto.ProductResponse;
import com.amazon.rematch.entity.Product;
import com.amazon.rematch.entity.Product.ConditionGrade;
import com.amazon.rematch.entity.Product.ConditionType;
import com.amazon.rematch.exception.ResourceNotFoundException;
import com.amazon.rematch.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ProductService {

    private final ProductRepository productRepository;

    public PagedResponse<ProductResponse> getAllProducts(String search, String category, int page, int size) {
        List<Product> raw;
        if (search != null && !search.isBlank() && category != null && !category.isBlank()) {
            raw = productRepository.findByCategoryAndKeyword(category.trim(), search.trim());
        } else if (search != null && !search.isBlank()) {
            raw = productRepository.searchByKeyword(search.trim());
        } else if (category != null && !category.isBlank()) {
            raw = productRepository.findByCategoryIgnoreCaseAndAvailableTrue(category.trim());
        } else {
            raw = productRepository.findAll();
        }
        return paginate(raw.stream().map(this::toResponse).toList(), page, size);
    }

    public ProductResponse getProductById(Long id) {
        return toResponse(productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product", id)));
    }

    public PagedResponse<ProductResponse> getByCategory(String category, String search, int page, int size) {
        List<Product> raw = productRepository.findByCategoryAndKeyword(
                category, search == null ? "" : search.trim());
        return paginate(raw.stream().map(this::toResponse).toList(), page, size);
    }

    public PagedResponse<ProductResponse> search(String keyword, int page, int size) {
        List<Product> raw = productRepository.searchByKeyword(keyword.trim());
        return paginate(raw.stream().map(this::toResponse).toList(), page, size);
    }

    public List<String> getCategories() {
        return productRepository.findDistinctCategories();
    }

    public List<ProductResponse> getRematchProducts() {
        return productRepository.findByAvailableTrueOrderByListedAtDesc()
                .stream().map(this::toResponse).toList();
    }

    public List<ProductResponse> getByConditionType(String conditionType) {
        return productRepository.findByConditionTypeAndAvailableTrue(parseConditionType(conditionType))
                .stream().map(this::toResponse).toList();
    }

    public List<ProductResponse> getByGrade(String grade) {
        return productRepository.findByConditionGradeAndAvailableTrue(parseGrade(grade))
                .stream().map(this::toResponse).toList();
    }

    public List<ProductResponse> getTopByLifeScore() {
        return productRepository.findTopByLifeScore()
                .stream().map(this::toResponse).toList();
    }

    @Transactional
    public Product save(Product product) {
        return productRepository.save(product);
    }

    // ── Pagination helper ─────────────────────────────────────────────────────

    private <T> PagedResponse<T> paginate(List<T> all, int page, int size) {
        int total = all.size();
        int totalPages = size > 0 ? (int) Math.ceil((double) total / size) : 1;
        int fromIndex = Math.min(page * size, total);
        int toIndex   = Math.min(fromIndex + size, total);
        return PagedResponse.<T>builder()
                .content(all.subList(fromIndex, toIndex))
                .page(page)
                .size(size)
                .totalElements(total)
                .totalPages(totalPages)
                .last(page >= totalPages - 1)
                .build();
    }

    // ── Mapper ────────────────────────────────────────────────────────────────

    public ProductResponse toResponse(Product p) {
        int discount = 0;
        if (p.getOriginalPrice() != null && p.getRematchPrice() != null
                && p.getOriginalPrice().compareTo(BigDecimal.ZERO) > 0) {
            discount = p.getOriginalPrice()
                    .subtract(p.getRematchPrice())
                    .multiply(BigDecimal.valueOf(100))
                    .divide(p.getOriginalPrice(), RoundingMode.HALF_UP)
                    .intValue();
        }
        return ProductResponse.builder()
                .id(p.getId())
                .title(p.getTitle())
                .description(p.getDescription())
                .originalPrice(p.getOriginalPrice())
                .rematchPrice(p.getRematchPrice())
                .discountPercent(discount)
                .category(p.getCategory())
                .imageUrl(p.getImageUrl())
                .rating(p.getRating())
                .reviewCount(p.getReviewCount())
                .conditionType(p.getConditionType())
                .conditionGrade(p.getConditionGrade())
                .lifeScore(p.getLifeScore())
                .aiVerified(p.getAiVerified())
                .aiAssessmentSummary(p.getAiAssessmentSummary())
                .available(p.getAvailable())
                .listedAt(p.getListedAt())
                .latitude(p.getLatitude())
                .longitude(p.getLongitude())
                .city(p.getCity())
                .state(p.getState())
                .country(p.getCountry())
                .build();
    }

    private ConditionType parseConditionType(String value) {
        try { return ConditionType.valueOf(value.toUpperCase()); }
        catch (IllegalArgumentException e) { throw new IllegalArgumentException("Invalid conditionType: " + value); }
    }

    private ConditionGrade parseGrade(String value) {
        try { return ConditionGrade.valueOf(value.toUpperCase()); }
        catch (IllegalArgumentException e) { throw new IllegalArgumentException("Invalid grade: " + value); }
    }
}

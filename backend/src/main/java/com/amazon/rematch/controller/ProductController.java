package com.amazon.rematch.controller;

import com.amazon.rematch.dto.ApiResponse;
import com.amazon.rematch.dto.PagedResponse;
import com.amazon.rematch.dto.ProductResponse;
import com.amazon.rematch.service.ProductService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/products")
public class ProductController {

    private final ProductService productService;

    /**
     * GET /products
     * Optional: ?search=keyword  &category=electronics  &page=0  &size=20
     */
    @GetMapping
    public ResponseEntity<ApiResponse<PagedResponse<ProductResponse>>> getAllProducts(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String category,
            @RequestParam(defaultValue = "0")  int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(ApiResponse.ok(
                productService.getAllProducts(search, category, page, size)));
    }

    /**
     * GET /products/{id}
     */
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ProductResponse>> getProductById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(productService.getProductById(id)));
    }

    /**
     * GET /products/category/{category}
     * Optional: ?search=keyword  &page=0  &size=20
     */
    @GetMapping("/category/{category}")
    public ResponseEntity<ApiResponse<PagedResponse<ProductResponse>>> getByCategory(
            @PathVariable String category,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0")  int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(ApiResponse.ok(
                productService.getByCategory(category, search, page, size)));
    }

    /**
     * GET /products/search?q=keyword
     * Optional: &page=0  &size=20
     */
    @GetMapping("/search")
    public ResponseEntity<ApiResponse<PagedResponse<ProductResponse>>> search(
            @RequestParam String q,
            @RequestParam(defaultValue = "0")  int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(ApiResponse.ok(productService.search(q, page, size)));
    }

    /**
     * GET /products/categories
     * Returns distinct category strings.
     */
    @GetMapping("/categories")
    public ResponseEntity<ApiResponse<List<String>>> getCategories() {
        return ResponseEntity.ok(ApiResponse.ok(productService.getCategories()));
    }

    /**
     * GET /rematch/products
     * ReMatch-specific: available refurbished/returned products.
     */
    @GetMapping("/rematch/products")
    public ResponseEntity<ApiResponse<List<ProductResponse>>> getRematchProducts(
            @RequestParam(required = false) String sort) {
        List<ProductResponse> result = "lifeScore".equalsIgnoreCase(sort)
                ? productService.getTopByLifeScore()
                : productService.getRematchProducts();
        return ResponseEntity.ok(ApiResponse.ok(result));
    }
}

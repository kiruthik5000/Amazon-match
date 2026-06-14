package com.amazon.rematch.controller;

import com.amazon.rematch.dto.ApiResponse;
import com.amazon.rematch.dto.PricePredictionRequest;
import com.amazon.rematch.dto.PricePredictionResponse;
import com.amazon.rematch.service.PricePredictionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/rematch/price-prediction")
@RequiredArgsConstructor
public class PricePredictionController {

    private final PricePredictionService predictionService;

    @PostMapping
    public ResponseEntity<ApiResponse<PricePredictionResponse>> predict(
        @Valid @RequestBody PricePredictionRequest request
    ) {
        PricePredictionResponse result = predictionService.predict(request);
        return ResponseEntity.ok(ApiResponse.ok("Price prediction successful", result));
    }
}

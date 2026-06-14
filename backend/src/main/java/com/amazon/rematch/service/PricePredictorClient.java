package com.amazon.rematch.service;

import com.amazon.rematch.dto.PricePredictionRequest;
import com.amazon.rematch.dto.PricePredictionResponse;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.ResourceAccessException;
import org.springframework.web.client.RestTemplate;

import java.math.BigDecimal;

@Slf4j
@Service
@RequiredArgsConstructor
public class PricePredictorClient {

    private final RestTemplate restTemplate;

    @Value("${price-predictor.base-url:http://localhost:8002}")
    private String baseUrl;

    @Value("${price-predictor.max-retries:2}")
    private int maxRetries;

    private static final String PREDICT_PATH = "/price/predict";

    public PricePredictionResponse predict(PricePredictionRequest req) {
        FastApiRequest body = toFastApiRequest(req);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        HttpEntity<FastApiRequest> entity = new HttpEntity<>(body, headers);

        RuntimeException lastEx = null;
        for (int attempt = 1; attempt <= maxRetries + 1; attempt++) {
            try {
                ResponseEntity<PricePredictionResponse> response = restTemplate.exchange(
                    baseUrl + PREDICT_PATH, HttpMethod.POST, entity, PricePredictionResponse.class
                );
                PricePredictionResponse result = response.getBody();
                if (result == null)
                    throw new PricePredictorException("Empty response from price predictor");
                log.debug("Price prediction: recommended={}, confidence={}",
                    result.getRecommendedPrice(), result.getConfidence());
                return result;
            } catch (ResourceAccessException ex) {
                lastEx = ex;
                log.warn("Price predictor attempt {}/{} failed: {}", attempt, maxRetries + 1, ex.getMessage());
                if (attempt <= maxRetries) sleep(500L * attempt);
            } catch (HttpClientErrorException ex) {
                log.error("Price predictor 4xx {}: {}", ex.getStatusCode(), ex.getResponseBodyAsString());
                throw new PricePredictorException("Price predictor rejected request: " + ex.getResponseBodyAsString(), ex);
            }
        }
        throw new PricePredictorException("Price predictor unreachable after " + (maxRetries + 1) + " attempts", lastEx);
    }

    private FastApiRequest toFastApiRequest(PricePredictionRequest req) {
        FastApiRequest r = new FastApiRequest();
        r.original_price     = req.getOriginalPrice().doubleValue();
        r.product_age_years  = req.getProductAgeYears().doubleValue();
        r.condition_grade    = req.getConditionGrade().toUpperCase();
        r.category           = req.getCategory();
        r.demand_score       = req.getDemandScore().doubleValue();
        return r;
    }

    private void sleep(long ms) {
        try { Thread.sleep(ms); } catch (InterruptedException e) { Thread.currentThread().interrupt(); }
    }

    // ── Internal DTO matching FastAPI snake_case request ─────────────────────
    static class FastApiRequest {
        @JsonProperty("original_price")    public double original_price;
        @JsonProperty("product_age_years") public double product_age_years;
        @JsonProperty("condition_grade")   public String condition_grade;
        @JsonProperty("category")          public String category;
        @JsonProperty("demand_score")      public double demand_score;
    }

    public static class PricePredictorException extends RuntimeException {
        public PricePredictorException(String msg) { super(msg); }
        public PricePredictorException(String msg, Throwable cause) { super(msg, cause); }
    }
}

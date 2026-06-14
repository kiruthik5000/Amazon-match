package com.amazon.rematch.service;

import com.amazon.rematch.dto.PricePredictionRequest;
import com.amazon.rematch.dto.PricePredictionResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class PricePredictionService {

    private final PricePredictorClient client;

    public PricePredictionResponse predict(PricePredictionRequest request) {
        log.info("Price prediction request — category={}, grade={}, age={}, originalPrice={}",
            request.getCategory(), request.getConditionGrade(),
            request.getProductAgeYears(), request.getOriginalPrice());
        return client.predict(request);
    }
}

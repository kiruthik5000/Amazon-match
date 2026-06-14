package com.amazon.rematch.service;

import com.amazon.rematch.dto.ConditionAnalysisResult;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.ResourceAccessException;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

@Slf4j
@Service
@RequiredArgsConstructor
public class ConditionAnalyzerClient {

    private final RestTemplate restTemplate;

    @Value("${condition-analyzer.base-url:http://localhost:8000}")
    private String baseUrl;

    @Value("${condition-analyzer.max-retries:2}")
    private int maxRetries;

    private static final String ANALYZE_PATH = "/condition/analyze";

    /**
     * Sends a single image to FastAPI and returns the condition analysis.
     * Retries up to {@code maxRetries} times on network failures.
     *
     * @throws ConditionAnalyzerException if FastAPI returns an error or is unreachable
     */
    public ConditionAnalysisResult analyze(MultipartFile file) {
        byte[] bytes = readBytes(file);
        String filename = file.getOriginalFilename() != null ? file.getOriginalFilename() : "image.jpg";
        String contentType = file.getContentType() != null ? file.getContentType() : "image/jpeg";

        RuntimeException lastException = null;

        for (int attempt = 1; attempt <= maxRetries + 1; attempt++) {
            try {
                return doAnalyze(bytes, filename, contentType);
            } catch (ResourceAccessException ex) {
                // network timeout / connection refused — retry
                lastException = ex;
                log.warn("Condition analyzer attempt {}/{} failed (network): {}", attempt, maxRetries + 1, ex.getMessage());
                if (attempt <= maxRetries) sleep(500L * attempt);
            } catch (HttpClientErrorException ex) {
                // 4xx — no point retrying
                log.error("Condition analyzer returned client error {}: {}", ex.getStatusCode(), ex.getResponseBodyAsString());
                throw new ConditionAnalyzerException("Condition analyzer rejected image: " + ex.getResponseBodyAsString(), ex);
            }
        }

        throw new ConditionAnalyzerException("Condition analyzer unreachable after " + (maxRetries + 1) + " attempts", lastException);
    }

    // ── private helpers ───────────────────────────────────────────────────────

    private ConditionAnalysisResult doAnalyze(byte[] bytes, String filename, String contentType) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.MULTIPART_FORM_DATA);

        ByteArrayResource imageResource = new ByteArrayResource(bytes) {
            @Override public String getFilename() { return filename; }
        };

        HttpHeaders fileHeaders = new HttpHeaders();
        fileHeaders.setContentType(MediaType.parseMediaType(contentType));
        HttpEntity<ByteArrayResource> filePart = new HttpEntity<>(imageResource, fileHeaders);

        MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
        body.add("file", filePart);

        HttpEntity<MultiValueMap<String, Object>> requestEntity = new HttpEntity<>(body, headers);

        ResponseEntity<ConditionAnalysisResult> response = restTemplate.exchange(
            baseUrl + ANALYZE_PATH,
            HttpMethod.POST,
            requestEntity,
            ConditionAnalysisResult.class
        );

        ConditionAnalysisResult result = response.getBody();
        if (result == null)
            throw new ConditionAnalyzerException("Empty response from condition analyzer");

        log.debug("Analyzed image '{}': grade={}, confidence={}, score={}",
            filename, result.getGrade(), result.getConfidence(), result.getConditionScore());

        return result;
    }

    private byte[] readBytes(MultipartFile file) {
        try {
            return file.getBytes();
        } catch (IOException ex) {
            throw new ConditionAnalyzerException("Failed to read image bytes: " + file.getOriginalFilename(), ex);
        }
    }

    private void sleep(long ms) {
        try { Thread.sleep(ms); } catch (InterruptedException e) { Thread.currentThread().interrupt(); }
    }

    // ── Typed exception ───────────────────────────────────────────────────────

    public static class ConditionAnalyzerException extends RuntimeException {
        public ConditionAnalyzerException(String message) { super(message); }
        public ConditionAnalyzerException(String message, Throwable cause) { super(message, cause); }
    }
}

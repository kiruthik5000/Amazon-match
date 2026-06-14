package com.amazon.rematch.service;

import com.amazon.rematch.dto.AiEvaluationResult;
import com.amazon.rematch.dto.ConditionAnalysisResult;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.concurrent.CompletableFuture;
import java.util.stream.IntStream;

@Slf4j
@Service
@RequiredArgsConstructor
public class ConditionAnalysisService {

    private final ConditionAnalyzerClient analyzerClient;
    private final ResaleValueCalculator   resaleValueCalculator;

    // Grade order for picking the best result across multiple images
    private static final List<String> GRADE_ORDER = List.of("A", "B", "C", "D");

    /**
     * Analyses all uploaded images in parallel, aggregates results,
     * and returns a single {@link AiEvaluationResult}.
     *
     * Strategy:
     *   - grade         → best (highest) grade across all images
     *   - confidenceScore → average of per-image confidences
     *   - lifeScore       → average of per-image condition scores
     *   - estimatedResaleValue → calculated from originalPrice × grade multiplier
     *   - aiSummary       → built from the best-grade image's details
     */
    public AiEvaluationResult evaluate(List<MultipartFile> images, BigDecimal originalPrice) {
        List<ConditionAnalysisResult> results = analyzeAllImages(images);

        if (results.isEmpty())
            throw new IllegalStateException("No analysis results returned from condition analyzer");

        // Pick best grade (closest to A)
        ConditionAnalysisResult best = results.stream()
            .min(Comparator.comparingInt(r -> GRADE_ORDER.indexOf(r.getGrade())))
            .orElse(results.get(0));

        // Average confidence and life score across all successful results
        double avgConfidence = results.stream()
            .mapToDouble(ConditionAnalysisResult::getConfidence)
            .average().orElse(best.getConfidence());

        double avgConditionScore = results.stream()
            .mapToDouble(ConditionAnalysisResult::getConditionScore)
            .average().orElse(best.getConditionScore());

        int confidencePercent = (int) Math.round(avgConfidence * 100);
        int lifeScore         = (int) Math.round(avgConditionScore);

        BigDecimal resaleValue = resaleValueCalculator.calculate(originalPrice, best.getGrade());
        String     summary     = buildSummary(best, results.size(), confidencePercent);

        log.info("AI evaluation complete — grade={}, confidence={}%, lifeScore={}, resaleValue={}",
            best.getGrade(), confidencePercent, lifeScore, resaleValue);

        return AiEvaluationResult.builder()
            .conditionGrade(best.getGrade())
            .confidenceScore(confidencePercent)
            .lifeScore(lifeScore)
            .estimatedResaleValue(resaleValue)
            .aiSummary(summary)
            .build();
    }

    // ── Parallel image analysis ───────────────────────────────────────────────

    private List<ConditionAnalysisResult> analyzeAllImages(List<MultipartFile> images) {
        List<CompletableFuture<ConditionAnalysisResult>> futures = IntStream.range(0, images.size())
            .mapToObj(i -> CompletableFuture.supplyAsync(() -> {
                MultipartFile file = images.get(i);
                try {
                    log.debug("Submitting image {} to condition analyzer: {}", i + 1, file.getOriginalFilename());
                    return analyzerClient.analyze(file);
                } catch (ConditionAnalyzerClient.ConditionAnalyzerException ex) {
                    log.warn("Image {} analysis failed, skipping: {}", i + 1, ex.getMessage());
                    return null; // gracefully skip failed images
                }
            }))
            .toList();

        List<ConditionAnalysisResult> results = new ArrayList<>();
        for (CompletableFuture<ConditionAnalysisResult> future : futures) {
            try {
                ConditionAnalysisResult result = future.join();
                if (result != null) results.add(result);
            } catch (Exception ex) {
                log.warn("Unexpected error joining analysis future: {}", ex.getMessage());
            }
        }

        if (results.isEmpty())
            throw new ConditionAnalyzerClient.ConditionAnalyzerException(
                "All image analyses failed. Please check the condition analyzer service.");

        return results;
    }

    // ── AI summary builder ────────────────────────────────────────────────────

    private String buildSummary(ConditionAnalysisResult best, int totalImages, int confidencePercent) {
        StringBuilder sb = new StringBuilder();
        sb.append(String.format("Condition grade %s (%s) assigned with %d%% confidence. ",
            best.getGrade(), best.getLabel(), confidencePercent));
        sb.append(String.format("%d image%s analysed. ",
            totalImages, totalImages > 1 ? "s" : ""));

        Map<String, Object> d = best.getDetails();
        if (d != null) {
            double scratch = toDouble(d.get("scratch_ratio"));
            double blur    = toDouble(d.get("blur_score"));

            if (scratch > 0.10)
                sb.append("Surface wear / scratch marks detected. ");
            else if (scratch > 0.05)
                sb.append("Minor cosmetic wear detected. ");
            else
                sb.append("Minimal surface wear detected. ");

            if (blur < 50)
                sb.append("Image sharpness is low — please provide clearer photos for better accuracy. ");
            else
                sb.append("Image quality is sufficient for accurate assessment. ");
        }

        sb.append("Suitable for listing on Amazon ReMatch.");
        return sb.toString().trim();
    }

    private double toDouble(Object val) {
        if (val == null) return 0.0;
        if (val instanceof Number) return ((Number) val).doubleValue();
        try { return Double.parseDouble(val.toString()); } catch (NumberFormatException e) { return 0.0; }
    }
}

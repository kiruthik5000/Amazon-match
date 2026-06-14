package com.amazon.rematch.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import software.amazon.awssdk.core.SdkBytes;
import software.amazon.awssdk.services.bedrockruntime.BedrockRuntimeClient;
import software.amazon.awssdk.services.bedrockruntime.model.InvokeModelRequest;
import software.amazon.awssdk.services.bedrockruntime.model.InvokeModelResponse;

@Slf4j
@Service
@RequiredArgsConstructor
public class BedrockService {

    private final BedrockRuntimeClient bedrockRuntimeClient;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Value("${bedrock.modelId}")
    private String modelId;

    @Value("${bedrock.maxTokens:300}")
    private int maxTokens;

    @Value("${bedrock.temperature:0.4}")
    private double temperature;

    /**
     * Sends a prompt to Claude via Amazon Bedrock and returns the text response.
     * Falls back to the provided fallbackText if the call fails.
     */
    public String invoke(String prompt, String fallbackText) {
        try {
            // Build Claude Messages API payload
            ObjectNode payload = objectMapper.createObjectNode();
            payload.put("anthropic_version", "bedrock-2023-05-31");
            payload.put("max_tokens", maxTokens);
            payload.put("temperature", temperature);

            ArrayNode messages = objectMapper.createArrayNode();
            ObjectNode userMsg = objectMapper.createObjectNode();
            userMsg.put("role", "user");

            ArrayNode content = objectMapper.createArrayNode();
            ObjectNode textContent = objectMapper.createObjectNode();
            textContent.put("type", "text");
            textContent.put("text", prompt);
            content.add(textContent);

            userMsg.set("content", content);
            messages.add(userMsg);
            payload.set("messages", messages);

            // Add a concise system instruction
            payload.put("system",
                "You are an AI assistant for Amazon ReMatch, a platform that sells returned " +
                "and refurbished products. Write short, friendly, factual explanations in 1-2 " +
                "sentences. No markdown, no bullet points. Be specific and helpful.");

            InvokeModelRequest request = InvokeModelRequest.builder()
                .modelId(modelId)
                .body(SdkBytes.fromUtf8String(objectMapper.writeValueAsString(payload)))
                .contentType("application/json")
                .accept("application/json")
                .build();

            InvokeModelResponse response = bedrockRuntimeClient.invokeModel(request);
            String responseBody = response.body().asUtf8String();

            JsonNode root = objectMapper.readTree(responseBody);
            return root.path("content").get(0).path("text").asText(fallbackText).trim();

        } catch (Exception e) {
            log.warn("Bedrock invocation failed, using fallback. Reason: {}", e.getMessage());
            return fallbackText;
        }
    }
}

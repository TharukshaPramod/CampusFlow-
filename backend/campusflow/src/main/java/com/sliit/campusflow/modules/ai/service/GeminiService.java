package com.sliit.campusflow.modules.ai.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.sliit.campusflow.modules.ai.dto.*;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.List;
import java.util.Map;

@Service
@Slf4j
public class GeminiService {

    private final HttpClient httpClient;
    private final ObjectMapper objectMapper;
    private final String apiKey;
    private final String model;
    private final String baseUrl;

    public GeminiService(
            @Value("${gemini.api-key}") String apiKey,
            @Value("${gemini.model:gemini-2.5-flash}") String model,
            @Value("${gemini.base-url:https://generativelanguage.googleapis.com/v1beta}") String baseUrl,
            ObjectMapper objectMapper) {
        this.apiKey = apiKey;
        this.model = model;
        this.baseUrl = baseUrl;
        this.objectMapper = objectMapper;
        this.httpClient = HttpClient.newBuilder()
                .connectTimeout(Duration.ofSeconds(15))
                .build();
        log.info("GeminiService initialized — model={}, baseUrl={}", model, baseUrl);
    }

    /**
     * Feature 1: Smart Triage — suggest category + priority from title + description
     */
    public AiTriageResponse triageIncident(AiTriageRequest request) {
        String prompt = String.format("""
            You are an AI assistant for a university campus maintenance system called CampusFlow.
            A user is reporting an incident. Based on the title and description below, suggest:
            1. The most appropriate CATEGORY (must be exactly one of: MAINTENANCE, IT_SUPPORT, PLUMBING, HVAC, OTHER)
            2. The most appropriate PRIORITY level (must be exactly one of: LOW, MEDIUM, HIGH, CRITICAL)
            3. A brief reasoning (1-2 sentences) explaining your suggestion.

            Title: %s
            Description: %s

            Respond ONLY in this exact JSON format, no markdown, no code blocks:
            {"suggestedCategory": "...", "suggestedPriority": "...", "reasoning": "..."}
            """, sanitize(request.getTitle()), sanitize(request.getDescription()));

        String response = callGemini(prompt);
        return parseTriageResponse(response);
    }

    /**
     * Feature 2: AI Resolution Assistant — suggest fix steps for technicians
     */
    public AiResolutionResponse suggestResolution(AiResolutionRequest request) {
        String prompt = String.format("""
            You are a technical resolution assistant for CampusFlow, a university campus management system.
            A technician needs help resolving this incident:

            Title: %s
            Category: %s
            Priority: %s
            Location: %s
            Description: %s

            Provide:
            1. A list of 3-5 concrete resolution steps the technician should follow
            2. An estimated time to resolve (e.g., "15-30 minutes", "1-2 hours")
            3. Any additional notes or safety warnings

            Respond ONLY in this exact JSON format, no markdown, no code blocks:
            {"steps": ["Step 1...", "Step 2...", "Step 3..."], "estimatedTime": "...", "additionalNotes": "..."}
            """,
                sanitize(request.getTitle()),
                sanitize(request.getCategory()),
                sanitize(request.getPriority()),
                sanitize(request.getLocation()),
                sanitize(request.getDescription()));

        String response = callGemini(prompt);
        return parseResolutionResponse(response);
    }

    /**
     * Feature 3: Thread Summarizer — summarize incident comment thread
     */
    public AiSummarizeResponse summarizeThread(AiSummarizeRequest request) {
        StringBuilder commentBlock = new StringBuilder();
        if (request.getComments() != null) {
            for (AiSummarizeRequest.CommentEntry c : request.getComments()) {
                commentBlock.append(String.format("- %s (%s): %s\n",
                        sanitize(c.getAuthor()), sanitize(c.getTimestamp()), sanitize(c.getContent())));
            }
        }

        String prompt = String.format("""
            You are an AI assistant for CampusFlow, a university campus management system.
            Summarize the following incident thread concisely:

            Incident Title: %s
            Incident Description: %s

            Comment Thread:
            %s

            Provide:
            1. A concise summary (2-3 sentences) of the entire thread
            2. The overall sentiment (one of: POSITIVE, NEUTRAL, NEGATIVE, URGENT)
            3. Whether any immediate action is required (a brief statement)

            Respond ONLY in this exact JSON format, no markdown, no code blocks:
            {"summary": "...", "sentiment": "...", "actionRequired": "..."}
            """,
                sanitize(request.getIncidentTitle()),
                sanitize(request.getIncidentDescription()),
                commentBlock.toString());

        String response = callGemini(prompt);
        return parseSummarizeResponse(response);
    }

    // ──────────────────────────────────────────────────────────────
    //  Internal helpers
    // ──────────────────────────────────────────────────────────────

    private String callGemini(String prompt) {
        String fullUrl = baseUrl + "/models/" + model + ":generateContent?key=" + apiKey;
        int maxRetries = 3;

        try {
            Map<String, Object> requestBody = Map.of(
                "contents", List.of(
                    Map.of("parts", List.of(
                        Map.of("text", prompt)
                    ))
                ),
                "generationConfig", Map.of(
                    "temperature", 0.3,
                    "maxOutputTokens", 1024
                )
            );

            String jsonBody = objectMapper.writeValueAsString(requestBody);
            log.debug("Gemini request URL: {}", fullUrl.replaceAll("key=.*", "key=***"));

            HttpRequest httpRequest = HttpRequest.newBuilder()
                    .uri(URI.create(fullUrl))
                    .header("Content-Type", "application/json")
                    .timeout(Duration.ofSeconds(30))
                    .POST(HttpRequest.BodyPublishers.ofString(jsonBody))
                    .build();

            // Retry loop for rate limiting (429)
            HttpResponse<String> httpResponse = null;
            for (int attempt = 1; attempt <= maxRetries; attempt++) {
                httpResponse = httpClient.send(httpRequest, HttpResponse.BodyHandlers.ofString());
                log.debug("Gemini response status: {} (attempt {})", httpResponse.statusCode(), attempt);

                if (httpResponse.statusCode() == 429) {
                    if (attempt < maxRetries) {
                        long waitMs = (long) Math.pow(2, attempt) * 1000; // 2s, 4s, 8s
                        log.warn("Gemini rate limited (429). Retrying in {}ms (attempt {}/{})", waitMs, attempt, maxRetries);
                        Thread.sleep(waitMs);
                        continue;
                    }
                    throw new RuntimeException("AI service is busy. Please wait a moment and try again.");
                }
                break; // Not a 429, exit retry loop
            }

            if (httpResponse == null) {
                throw new RuntimeException("AI service returned no response.");
            }

            if (httpResponse.statusCode() != 200) {
                log.error("Gemini API returned HTTP {}: {}", httpResponse.statusCode(), httpResponse.body());
                throw new RuntimeException("Gemini API returned HTTP " + httpResponse.statusCode());
            }

            String responseBody = httpResponse.body();

            // Extract text from Gemini response structure
            JsonNode root = objectMapper.readTree(responseBody);

            // Check for API-level errors
            if (root.has("error")) {
                String errorMsg = root.path("error").path("message").asText("Unknown API error");
                log.error("Gemini API error: {}", errorMsg);
                throw new RuntimeException("Gemini API error: " + errorMsg);
            }

            JsonNode candidates = root.path("candidates");
            if (candidates.isArray() && !candidates.isEmpty()) {
                JsonNode content = candidates.get(0).path("content");
                JsonNode parts = content.path("parts");
                if (parts.isArray() && !parts.isEmpty()) {
                    String text = parts.get(0).path("text").asText("");
                    log.debug("Gemini extracted text: {}", text);
                    return text;
                }
            }

            log.warn("Gemini returned unexpected structure: {}", responseBody);
            return "{}";
        } catch (RuntimeException e) {
            throw e;
        } catch (Exception e) {
            log.error("Gemini API call failed: {}", e.getMessage(), e);
            throw new RuntimeException("AI service is temporarily unavailable: " + e.getMessage());
        }
    }

    private String cleanJsonResponse(String raw) {
        if (raw == null) return "{}";
        String cleaned = raw.trim();
        // Remove markdown code block wrapping if present
        if (cleaned.startsWith("```json")) {
            cleaned = cleaned.substring(7);
        } else if (cleaned.startsWith("```")) {
            cleaned = cleaned.substring(3);
        }
        if (cleaned.endsWith("```")) {
            cleaned = cleaned.substring(0, cleaned.length() - 3);
        }
        return cleaned.trim();
    }

    private AiTriageResponse parseTriageResponse(String raw) {
        try {
            String json = cleanJsonResponse(raw);
            return objectMapper.readValue(json, AiTriageResponse.class);
        } catch (Exception e) {
            log.warn("Failed to parse triage response: {}", raw, e);
            return AiTriageResponse.builder()
                    .suggestedCategory("OTHER")
                    .suggestedPriority("MEDIUM")
                    .reasoning("AI was unable to analyze this incident. Please set category and priority manually.")
                    .build();
        }
    }

    private AiResolutionResponse parseResolutionResponse(String raw) {
        try {
            String json = cleanJsonResponse(raw);
            return objectMapper.readValue(json, AiResolutionResponse.class);
        } catch (Exception e) {
            log.warn("Failed to parse resolution response: {}", raw, e);
            return AiResolutionResponse.builder()
                    .steps(List.of("Inspect the reported issue on-site", "Document findings", "Apply appropriate fix", "Verify resolution with reporter"))
                    .estimatedTime("Varies")
                    .additionalNotes("AI was unable to generate specific steps. Please assess the situation on-site.")
                    .build();
        }
    }

    private AiSummarizeResponse parseSummarizeResponse(String raw) {
        try {
            String json = cleanJsonResponse(raw);
            return objectMapper.readValue(json, AiSummarizeResponse.class);
        } catch (Exception e) {
            log.warn("Failed to parse summarize response: {}", raw, e);
            return AiSummarizeResponse.builder()
                    .summary("AI was unable to summarize this thread. Please review the comments manually.")
                    .sentiment("NEUTRAL")
                    .actionRequired("Review needed")
                    .build();
        }
    }

    private String sanitize(String input) {
        if (input == null) return "";
        return input.replace("\\", "\\\\")
                     .replace("\"", "'")
                     .replace("\n", " ")
                     .replace("\r", " ");
    }
}

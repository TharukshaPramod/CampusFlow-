package com.sliit.campusflow.modules.ai.controller;

import com.sliit.campusflow.modules.ai.dto.*;
import com.sliit.campusflow.modules.ai.service.GeminiService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.access.prepost.PreAuthorize;
import jakarta.validation.Valid;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/ai")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "AI Assistant", description = "Gemini AI-powered features for incident management")
@CrossOrigin(origins = "*", maxAge = 3600)
public class GeminiController {

    private final GeminiService geminiService;

    private ResponseEntity<?> handleError(Exception e, String context) {
        log.error("{} failed: {}", context, e.getMessage());
        if (e.getMessage() != null && e.getMessage().contains("busy")) {
            return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS)
                    .body(Map.of("message", e.getMessage()));
        }
        return ResponseEntity.internalServerError()
                .body(Map.of("message", context + " failed: " + e.getMessage()));
    }

    @PostMapping("/triage")
    @Operation(summary = "AI Smart Triage — suggest category and priority for an incident")
    public ResponseEntity<?> triageIncident(@RequestBody AiTriageRequest request) {
        try {
            return ResponseEntity.ok(geminiService.triageIncident(request));
        } catch (Exception e) {
            return handleError(e, "AI triage");
        }
    }

    @PostMapping("/resolution")
    @Operation(summary = "AI Resolution Assistant — suggest fix steps for technicians")
    public ResponseEntity<?> suggestResolution(@RequestBody AiResolutionRequest request) {
        try {
            return ResponseEntity.ok(geminiService.suggestResolution(request));
        } catch (Exception e) {
            return handleError(e, "AI resolution");
        }
    }

    @PostMapping("/summarize")
    @Operation(summary = "AI Thread Summarizer — summarize incident comment thread")
    public ResponseEntity<?> summarizeThread(@RequestBody AiSummarizeRequest request) {
        try {
            return ResponseEntity.ok(geminiService.summarizeThread(request));
        } catch (Exception e) {
            return handleError(e, "AI summarization");
        }
    }

    @PostMapping("/chat")
    public ResponseEntity<?> chatWithBot(@Valid @RequestBody AiChatRequest request) {
        try {
            return ResponseEntity.ok(geminiService.chatWithBot(request));
        } catch (Exception e) {
            return handleError(e, "AI chat");
        }
    }
}


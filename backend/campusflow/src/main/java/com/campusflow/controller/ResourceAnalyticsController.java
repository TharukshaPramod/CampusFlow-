package com.campusflow.controller;

import com.campusflow.dto.ResourceAnalyticsResponse;
import com.campusflow.service.ResourceAnalyticsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/analytics")
@RequiredArgsConstructor
@CrossOrigin(origins = "${app.cors.origins}")
public class ResourceAnalyticsController {

    private final ResourceAnalyticsService analyticsService;

    // GET /api/v1/analytics/resources
    @GetMapping("/resources")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ResourceAnalyticsResponse> getResourceAnalytics() {
        return ResponseEntity.ok(analyticsService.getResourceAnalytics());
    }
}
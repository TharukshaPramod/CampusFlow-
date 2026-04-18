package com.sliit.campusflow.modules.admin.controller;

import com.sliit.campusflow.modules.admin.dto.ResourceAnalyticsResponse;
import com.sliit.campusflow.modules.admin.service.ResourceAnalyticsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin/analytics")
@RequiredArgsConstructor
@CrossOrigin(origins = "*", maxAge = 3600)
public class AnalyticsController {

    private final ResourceAnalyticsService analyticsService;

    // GET /api/admin/analytics/resources
    @GetMapping("/resources")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ResourceAnalyticsResponse> getResourceAnalytics() {
        return ResponseEntity.ok(analyticsService.getResourceAnalytics());
    }
}

package com.campusflow.controller;

import com.campusflow.dto.ResourceRequest;
import com.campusflow.dto.ResourceResponse;
import com.campusflow.service.ResourceService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/resources")
@RequiredArgsConstructor
@CrossOrigin(origins = "${app.cors.origins}")
public class ResourceController {

    private final ResourceService resourceService;

    // GET /api/v1/resources
    @GetMapping
    public ResponseEntity<List<ResourceResponse>> getResources(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String building,
            @RequestParam(required = false) String location,
            @RequestParam(required = false) Integer minCapacity,
            @RequestParam(required = false) UUID resourceTypeId,
            @RequestParam(required = false) Boolean requiresApproval) {

        if (status != null || building != null || location != null ||
                minCapacity != null || resourceTypeId != null || requiresApproval != null) {
            return ResponseEntity.ok(resourceService.searchResources(
                    status, building, location, minCapacity, resourceTypeId, requiresApproval));
        }
        return ResponseEntity.ok(resourceService.getAllResources());
    }

    // GET /api/v1/resources/{id}
    @GetMapping("/{id}")
    public ResponseEntity<ResourceResponse> getResourceById(@PathVariable UUID id) {
        return ResponseEntity.ok(resourceService.getResourceById(id));
    }

    // POST /api/v1/resources
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ResourceResponse> createResource(
            @Valid @RequestBody ResourceRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(resourceService.createResource(request, userDetails.getUsername()));
    }

    // PUT /api/v1/resources/{id}
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ResourceResponse> updateResource(
            @PathVariable UUID id,
            @Valid @RequestBody ResourceRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(resourceService.updateResource(id, request, userDetails.getUsername()));
    }

    // DELETE /api/v1/resources/{id}
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteResource(@PathVariable UUID id) {
        resourceService.deleteResource(id);
        return ResponseEntity.noContent().build();
    }
}
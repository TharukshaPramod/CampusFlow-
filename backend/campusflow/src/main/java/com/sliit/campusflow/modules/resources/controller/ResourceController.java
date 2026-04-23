package com.sliit.campusflow.modules.resources.controller;

import com.sliit.campusflow.modules.resources.dto.ResourceRequest;
import com.sliit.campusflow.modules.resources.dto.ResourceResponse;
import com.sliit.campusflow.modules.resources.service.ResourceService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.lang.NonNull;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.*;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.NoSuchElementException;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/resources")
@RequiredArgsConstructor
@Tag(name = "Resources", description = "Facilities and assets management endpoints")
@CrossOrigin(origins = "*", maxAge = 3600)
public class ResourceController {

    private final ResourceService resourceService;

    @GetMapping
    @Operation(summary = "Get all resources with pagination")
    public ResponseEntity<Page<ResourceResponse>> getAllResources(
            @PageableDefault(size = 20, sort = "name", direction = Sort.Direction.ASC) @NonNull Pageable pageable) {
        return ResponseEntity.ok(resourceService.getAllResources(pageable));
    }

    @GetMapping("/search")
    @Operation(summary = "Search resources with filters")
    public ResponseEntity<Page<ResourceResponse>> searchResources(
            @RequestParam(required = false) String searchTerm,
            @RequestParam(required = false) UUID typeId,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) Integer minCapacity,
            @RequestParam(required = false) String building,
            @PageableDefault(size = 20) Pageable pageable) {
        return ResponseEntity.ok(resourceService.searchResources(
                searchTerm, typeId, status, minCapacity, building, pageable));
    }

    @GetMapping("/available")
    @Operation(summary = "Get available resources by filters")
    public ResponseEntity<List<ResourceResponse>> getAvailableResources(
            @RequestParam(required = false) UUID typeId,
            @RequestParam(required = false) String status) {
        return ResponseEntity.ok(resourceService.getAvailableResources(typeId, status));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get resource by ID")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Resource found"),
            @ApiResponse(responseCode = "404", description = "Resource not found")
    })
    public ResponseEntity<ResourceResponse> getResourceById(@PathVariable @NonNull UUID id) {
        return ResponseEntity.ok(resourceService.getResourceById(id));
    }

    @GetMapping("/code/{code}")
    @Operation(summary = "Get resource by code")
    public ResponseEntity<ResourceResponse> getResourceByCode(@PathVariable String code) {
        return ResponseEntity.ok(resourceService.getResourceByCode(code));
    }

    @PostMapping
    @Operation(summary = "Create a new resource")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> createResource(@Valid @RequestBody ResourceRequest request) {
        try {
            return ResponseEntity.status(HttpStatus.CREATED).body(resourceService.createResource(request));
        } catch (IllegalArgumentException | IllegalStateException | DataIntegrityViolationException ex) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of("message", ex.getMessage()));
        }
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update an existing resource")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> updateResource(
            @PathVariable @NonNull UUID id,
            @Valid @RequestBody ResourceRequest request) {
        try {
            return ResponseEntity.ok(resourceService.updateResource(id, request));
        } catch (NoSuchElementException ex) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", ex.getMessage()));
        } catch (IllegalArgumentException | IllegalStateException | DataIntegrityViolationException ex) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of("message", ex.getMessage()));
        }
    }

    @PatchMapping("/{id}/status")
    @Operation(summary = "Update resource status")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<ResourceResponse> updateResourceStatus(
            @PathVariable @NonNull UUID id,
            @RequestParam String status) {
        return ResponseEntity.ok(resourceService.updateResourceStatus(id, status));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete a resource")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteResource(@PathVariable @NonNull UUID id) {
        resourceService.deleteResource(id);
        return ResponseEntity.noContent().build();
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, Object>> handleValidationErrors(MethodArgumentNotValidException ex) {
        Map<String, String> fields = new LinkedHashMap<>();
        for (FieldError fieldError : ex.getBindingResult().getFieldErrors()) {
            fields.putIfAbsent(fieldError.getField(), fieldError.getDefaultMessage());
        }

        Map<String, Object> body = new LinkedHashMap<>();
        body.put("message", "Validation failed");
        body.put("errors", fields);

        return ResponseEntity.badRequest().body(body);
    }
}
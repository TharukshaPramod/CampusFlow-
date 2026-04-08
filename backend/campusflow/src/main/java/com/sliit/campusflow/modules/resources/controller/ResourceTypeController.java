package com.sliit.campusflow.modules.resources.controller;

import com.sliit.campusflow.modules.resources.dto.ResourceTypeRequest;
import com.sliit.campusflow.modules.resources.dto.ResourceTypeResponse;
import com.sliit.campusflow.modules.resources.service.ResourceTypeService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.lang.NonNull;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/resource-types")
@RequiredArgsConstructor
@Tag(name = "Resource Types", description = "Resource type management endpoints")
@CrossOrigin(origins = "*", maxAge = 3600)
public class ResourceTypeController {

    private final ResourceTypeService resourceTypeService;

    @GetMapping
    @Operation(summary = "Get all resource types with pagination")
    public ResponseEntity<Page<ResourceTypeResponse>> getAllResourceTypes(
            @PageableDefault(size = 20, sort = "name", direction = Sort.Direction.ASC) @NonNull Pageable pageable) {
        return ResponseEntity.ok(resourceTypeService.getAllResourceTypes(pageable));
    }

    @GetMapping("/search")
    @Operation(summary = "Search resource types")
    public ResponseEntity<Page<ResourceTypeResponse>> searchResourceTypes(
            @RequestParam String q,
            @PageableDefault(size = 20) Pageable pageable) {
        return ResponseEntity.ok(resourceTypeService.searchResourceTypes(q, pageable));
    }

    @GetMapping("/category/{category}")
    @Operation(summary = "Get resource types by category")
    public ResponseEntity<List<ResourceTypeResponse>> getResourceTypesByCategory(
            @PathVariable String category) {
        return ResponseEntity.ok(resourceTypeService.getResourceTypesByCategory(category));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get resource type by ID")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Resource type found"),
            @ApiResponse(responseCode = "404", description = "Resource type not found")
    })
    public ResponseEntity<ResourceTypeResponse> getResourceTypeById(@PathVariable @NonNull UUID id) {
        return ResponseEntity.ok(resourceTypeService.getResourceTypeById(id));
    }

    @GetMapping("/name/{name}")
    @Operation(summary = "Get resource type by name")
    public ResponseEntity<ResourceTypeResponse> getResourceTypeByName(@PathVariable String name) {
        return ResponseEntity.ok(resourceTypeService.getResourceTypeByName(name));
    }

    @PostMapping
    @Operation(summary = "Create a new resource type")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ResourceTypeResponse> createResourceType(
            @Valid @RequestBody ResourceTypeRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(resourceTypeService.createResourceType(request));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update an existing resource type")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ResourceTypeResponse> updateResourceType(
            @PathVariable @NonNull UUID id,
            @Valid @RequestBody ResourceTypeRequest request) {
        return ResponseEntity.ok(resourceTypeService.updateResourceType(id, request));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete a resource type")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteResourceType(@PathVariable @NonNull UUID id) {
        resourceTypeService.deleteResourceType(id);
        return ResponseEntity.noContent().build();
    }
}
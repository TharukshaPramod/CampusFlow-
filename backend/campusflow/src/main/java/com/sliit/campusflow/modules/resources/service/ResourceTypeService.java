package com.sliit.campusflow.modules.resources.service;

import com.sliit.campusflow.modules.resources.dto.ResourceTypeRequest;
import com.sliit.campusflow.modules.resources.dto.ResourceTypeResponse;
import com.sliit.campusflow.modules.resources.mapper.ResourceTypeMapper;
import com.sliit.campusflow.modules.resources.model.ResourceType;
import com.sliit.campusflow.modules.resources.repository.ResourceRepository;
import com.sliit.campusflow.modules.resources.repository.ResourceTypeRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.NoSuchElementException;
import java.util.Objects;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class ResourceTypeService {

    private final ResourceTypeRepository resourceTypeRepository;
    private final ResourceRepository resourceRepository;
    private final ResourceTypeMapper resourceTypeMapper;

    @Cacheable(value = "resourceTypes", key = "#id")
    public ResourceTypeResponse getResourceTypeById(UUID id) {
        final UUID safeId = Objects.requireNonNull(id, "id must not be null");
        log.debug("Fetching resource type by id: {}", safeId);
        return resourceTypeRepository.findById(safeId)
                .map(resourceTypeMapper::toResponse)
                .orElseThrow(() -> new RuntimeException("Resource type not found with id: " + safeId));
    }

    @Cacheable(value = "resourceTypes", key = "#name")
    public ResourceTypeResponse getResourceTypeByName(String name) {
        log.debug("Fetching resource type by name: {}", name);
        return resourceTypeRepository.findByName(name)
                .map(resourceTypeMapper::toResponse)
                .orElseThrow(() -> new RuntimeException("Resource type not found with name: " + name));
    }

    @Cacheable(value = "resourceTypes-all", key = "#pageable.pageNumber + '-' + #pageable.pageSize")
    public Page<ResourceTypeResponse> getAllResourceTypes(Pageable pageable) {
        final Pageable safePageable = Objects.requireNonNull(pageable, "pageable must not be null");
        log.debug("Fetching all resource types with pagination: {}", safePageable);
        return resourceTypeRepository.findAll(safePageable)
                .map(resourceTypeMapper::toResponse);
    }

    public List<ResourceTypeResponse> getResourceTypesByCategory(String category) {
        log.debug("Fetching resource types by category: {}", category);
        return resourceTypeMapper.toResponseList(
                resourceTypeRepository.findByCategory(category));
    }

    public Page<ResourceTypeResponse> searchResourceTypes(String searchTerm, Pageable pageable) {
        log.debug("Searching resource types with term: {}", searchTerm);
        return resourceTypeRepository.search(searchTerm, pageable)
                .map(resourceTypeMapper::toResponse);
    }

    @CacheEvict(value = { "resourceTypes", "resourceTypes-all" }, allEntries = true)
    public ResourceTypeResponse createResourceType(ResourceTypeRequest request) {
        final ResourceTypeRequest safeRequest = Objects.requireNonNull(request, "request must not be null");
        final String normalizedName = normalizeRequired(safeRequest.getName(), "Resource type name is required");
        final String normalizedCategory = normalizeRequired(safeRequest.getCategory(), "Category is required")
                .toUpperCase();
        final String normalizedDescription = normalizeOptional(safeRequest.getDescription());
        final String normalizedIcon = normalizeOptional(safeRequest.getIcon());

        log.debug("Creating new resource type: {}", normalizedName);

        if (resourceTypeRepository.findByNameIgnoreCase(normalizedName).isPresent()) {
            throw new IllegalArgumentException("Resource type with name '" + normalizedName + "' already exists");
        }

        ResourceType resourceType = Objects.requireNonNull(
                resourceTypeMapper.toEntity(safeRequest),
                "Mapped ResourceType must not be null");
        if (resourceType.getVersion() == null) {
            resourceType.setVersion(0L);
        }
        resourceType.setName(normalizedName);
        resourceType.setCategory(normalizedCategory);
        resourceType.setDescription(normalizedDescription);
        resourceType.setIcon(normalizedIcon);

        ResourceType savedResourceType;
        try {
            savedResourceType = resourceTypeRepository.saveAndFlush(resourceType);
        } catch (DataIntegrityViolationException ex) {
            String detail = extractMostSpecificCauseMessage(ex);
            throw new IllegalStateException("Failed to persist resource type: " + detail, ex);
        }

        log.info("Resource type created successfully with id: {}", savedResourceType.getId());
        return resourceTypeMapper.toResponse(savedResourceType);
    }

    @CacheEvict(value = { "resourceTypes", "resourceTypes-all" }, allEntries = true)
    public ResourceTypeResponse updateResourceType(UUID id, ResourceTypeRequest request) {
        final UUID safeId = Objects.requireNonNull(id, "id must not be null");
        final ResourceTypeRequest safeRequest = Objects.requireNonNull(request, "request must not be null");
        final String normalizedName = normalizeRequired(safeRequest.getName(), "Resource type name is required");
        final String normalizedCategory = normalizeRequired(safeRequest.getCategory(), "Category is required")
                .toUpperCase();
        final String normalizedDescription = normalizeOptional(safeRequest.getDescription());
        final String normalizedIcon = normalizeOptional(safeRequest.getIcon());

        log.debug("Updating resource type with id: {} and name: {}", safeId, normalizedName);

        ResourceType existingResourceType = resourceTypeRepository.findById(safeId)
                .orElseThrow(() -> new NoSuchElementException("Resource type not found with id: " + safeId));

        resourceTypeRepository.findByNameIgnoreCase(normalizedName)
                .filter(found -> !safeId.equals(found.getId()))
                .ifPresent(found -> {
                    throw new IllegalArgumentException(
                            "Resource type with name '" + normalizedName + "' already exists");
                });

        existingResourceType.setName(normalizedName);
        existingResourceType.setCategory(normalizedCategory);
        existingResourceType.setDescription(normalizedDescription);
        existingResourceType.setIcon(normalizedIcon);
        if (existingResourceType.getVersion() == null) {
            existingResourceType.setVersion(0L);
        }
        ResourceType updatedResourceType;
        try {
            updatedResourceType = resourceTypeRepository.saveAndFlush(existingResourceType);
        } catch (DataIntegrityViolationException ex) {
            String detail = extractMostSpecificCauseMessage(ex);
            throw new IllegalStateException("Failed to persist resource type update: " + detail, ex);
        }

        log.info("Resource type updated successfully with id: {}", updatedResourceType.getId());
        return resourceTypeMapper.toResponse(updatedResourceType);
    }

    private String normalizeRequired(String value, String message) {
        String normalized = normalizeOptional(value);
        if (normalized == null) {
            throw new IllegalArgumentException(message);
        }
        return normalized;
    }

    private String normalizeOptional(String value) {
        if (value == null) {
            return null;
        }
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }

    private String extractMostSpecificCauseMessage(Throwable throwable) {
        Throwable current = throwable;
        Throwable previous = null;

        while (current != null && current != previous) {
            previous = current;
            current = current.getCause();
        }

        String message = previous != null ? previous.getMessage() : throwable.getMessage();
        if (message == null || message.isBlank()) {
            return "Unknown database constraint error";
        }
        return message;
    }

    @CacheEvict(value = { "resourceTypes", "resourceTypes-all" }, allEntries = true)
    public void deleteResourceType(UUID id) {
        final UUID safeId = Objects.requireNonNull(id, "id must not be null");
        log.debug("Deleting resource type with id: {}", safeId);

        if (!resourceTypeRepository.existsById(safeId)) {
            throw new NoSuchElementException("Resource type not found with id: " + safeId);
        }

        long linkedResources = resourceRepository
                .count((root, query, cb) -> cb.equal(root.get("resourceType").get("id"), safeId));
        if (linkedResources > 0) {
            throw new IllegalStateException("Cannot delete resource type that is in use by " +
                    linkedResources + " resources");
        }

        int deletedCount = resourceTypeRepository.deleteByIdDirect(safeId);
        if (deletedCount == 0) {
            throw new NoSuchElementException("Resource type not found with id: " + safeId);
        }
        log.info("Resource type deleted successfully with id: {}", safeId);
    }
}
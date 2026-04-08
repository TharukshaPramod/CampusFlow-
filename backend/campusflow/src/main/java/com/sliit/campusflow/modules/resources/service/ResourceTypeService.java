package com.sliit.campusflow.modules.resources.service;

import com.sliit.campusflow.modules.resources.dto.ResourceTypeRequest;
import com.sliit.campusflow.modules.resources.dto.ResourceTypeResponse;
import com.sliit.campusflow.modules.resources.mapper.ResourceTypeMapper;
import com.sliit.campusflow.modules.resources.model.ResourceType;
import com.sliit.campusflow.modules.resources.repository.ResourceTypeRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Objects;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class ResourceTypeService {

    private final ResourceTypeRepository resourceTypeRepository;
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

    @CacheEvict(value = {"resourceTypes", "resourceTypes-all"}, allEntries = true)
    public ResourceTypeResponse createResourceType(ResourceTypeRequest request) {
        final ResourceTypeRequest safeRequest = Objects.requireNonNull(request, "request must not be null");
        log.debug("Creating new resource type: {}", safeRequest.getName());

        if (resourceTypeRepository.existsByName(safeRequest.getName())) {
            throw new RuntimeException("Resource type with name '" + safeRequest.getName() + "' already exists");
        }

        ResourceType resourceType = Objects.requireNonNull(
            resourceTypeMapper.toEntity(safeRequest),
            "Mapped ResourceType must not be null"
        );
        ResourceType savedResourceType = resourceTypeRepository.save(resourceType);
        
        log.info("Resource type created successfully with id: {}", savedResourceType.getId());
        return resourceTypeMapper.toResponse(savedResourceType);
    }

    @CacheEvict(value = {"resourceTypes", "resourceTypes-all"}, allEntries = true)
    public ResourceTypeResponse updateResourceType(UUID id, ResourceTypeRequest request) {
        final UUID safeId = Objects.requireNonNull(id, "id must not be null");
        final ResourceTypeRequest safeRequest = Objects.requireNonNull(request, "request must not be null");
        log.debug("Updating resource type with id: {}", safeId);

        ResourceType existingResourceType = resourceTypeRepository.findById(safeId)
                .orElseThrow(() -> new RuntimeException("Resource type not found with id: " + safeId));

        if (!existingResourceType.getName().equals(safeRequest.getName()) &&
            resourceTypeRepository.existsByName(safeRequest.getName())) {
            throw new RuntimeException("Resource type with name '" + safeRequest.getName() + "' already exists");
        }

        resourceTypeMapper.updateEntity(safeRequest, existingResourceType);
        ResourceType updatedResourceType = resourceTypeRepository.save(existingResourceType);
        
        log.info("Resource type updated successfully with id: {}", updatedResourceType.getId());
        return resourceTypeMapper.toResponse(updatedResourceType);
    }

    @CacheEvict(value = {"resourceTypes", "resourceTypes-all"}, allEntries = true)
    public void deleteResourceType(UUID id) {
        final UUID safeId = Objects.requireNonNull(id, "id must not be null");
        log.debug("Deleting resource type with id: {}", safeId);

        ResourceType resourceType = resourceTypeRepository.findById(safeId)
            .orElseThrow(() -> new RuntimeException("Resource type not found with id: " + safeId));

        if (resourceType.getResources() != null && !resourceType.getResources().isEmpty()) {
            throw new RuntimeException("Cannot delete resource type that is in use by " + 
                                       resourceType.getResources().size() + " resources");
        }

        resourceTypeRepository.deleteById(safeId);
        log.info("Resource type deleted successfully with id: {}", safeId);
    }
}
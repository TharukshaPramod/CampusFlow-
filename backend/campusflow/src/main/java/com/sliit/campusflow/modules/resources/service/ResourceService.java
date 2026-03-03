package com.sliit.campusflow.modules.resources.service;

import com.sliit.campusflow.modules.resources.dto.ResourceRequest;
import com.sliit.campusflow.modules.resources.dto.ResourceResponse;
import com.sliit.campusflow.modules.resources.mapper.ResourceMapper;
import com.sliit.campusflow.modules.resources.model.Resource;
import com.sliit.campusflow.modules.resources.model.ResourceType;
import com.sliit.campusflow.modules.resources.repository.ResourceRepository;
import com.sliit.campusflow.modules.resources.repository.ResourceTypeRepository;
import jakarta.persistence.criteria.Predicate;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import org.springframework.lang.NonNull;

import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class ResourceService {

    private final ResourceRepository resourceRepository;
    private final ResourceTypeRepository resourceTypeRepository;
    private final ResourceMapper resourceMapper;

    @Cacheable(value = "resources", key = "#id")
    public ResourceResponse getResourceById(@NonNull UUID id) {
        log.debug("Fetching resource by id: {}", id);
        return resourceRepository.findById(id)
                .map(resourceMapper::toResponse)
                .orElseThrow(() -> new RuntimeException("Resource not found with id: " + id));
    }

    @Cacheable(value = "resources", key = "#code")
    public ResourceResponse getResourceByCode(String code) {
        log.debug("Fetching resource by code: {}", code);
        return resourceRepository.findByCode(code)
                .map(resourceMapper::toResponse)
                .orElseThrow(() -> new RuntimeException("Resource not found with code: " + code));
    }

    @Cacheable(value = "resources-all", key = "#pageable.pageNumber + '-' + #pageable.pageSize")
    public Page<ResourceResponse> getAllResources(@NonNull Pageable pageable) {
        log.debug("Fetching all resources with pagination: {}", pageable);
        return resourceRepository.findAll(pageable)
                .map(resourceMapper::toResponse);
    }

    public Page<ResourceResponse> searchResources(
            String searchTerm,
            UUID typeId,
            String status,
            Integer minCapacity,
            String building,
            Pageable pageable) {

        Specification<Resource> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (searchTerm != null && !searchTerm.isEmpty()) {
                String pattern = "%" + searchTerm.toLowerCase() + "%";
                Predicate namePredicate = cb.like(cb.lower(root.get("name")), pattern);
                Predicate codePredicate = cb.like(cb.lower(root.get("code")), pattern);
                Predicate locationPredicate = cb.like(cb.lower(root.get("location")), pattern);
                predicates.add(cb.or(namePredicate, codePredicate, locationPredicate));
            }

            if (typeId != null) {
                predicates.add(cb.equal(root.get("resourceType").get("id"), typeId));
            }

            if (status != null) {
                predicates.add(cb.equal(root.get("status"), status));
            }

            if (minCapacity != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("capacity"), minCapacity));
            }

            if (building != null && !building.isEmpty()) {
                predicates.add(cb.like(cb.lower(root.get("building")), "%" + building.toLowerCase() + "%"));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };

        if (pageable == null) {
            pageable = Pageable.unpaged();
        }
        return resourceRepository.findAll(spec, pageable)
                .map(resourceMapper::toResponse);
    }

    @CacheEvict(value = {"resources", "resources-all"}, allEntries = true)
    public ResourceResponse createResource(ResourceRequest request) {
        log.debug("Creating new resource: {}", request.getName());

        // Check if code is unique if provided
        if (request.getCode() != null && resourceRepository.findByCode(request.getCode()).isPresent()) {
            throw new RuntimeException("Resource with code " + request.getCode() + " already exists");
        }

        UUID resourceTypeId = request.getResourceTypeId();
        if (resourceTypeId == null) {
            throw new RuntimeException("Resource type id is required");
        }

        ResourceType resourceType = resourceTypeRepository.findById(resourceTypeId)
                .orElseThrow(() -> new RuntimeException("Resource type not found"));

        Resource resource = resourceMapper.toEntity(request);
        resource.setResourceType(resourceType);

        Resource savedResource = resourceRepository.save(Objects.requireNonNull(resource));
        log.info("Resource created successfully with id: {}", savedResource.getId());

        return resourceMapper.toResponse(savedResource);
    }

    @CacheEvict(value = {"resources", "resources-all"}, allEntries = true)
    public ResourceResponse updateResource(@NonNull UUID id, ResourceRequest request) {
        log.debug("Updating resource with id: {}", id);

        Resource existingResource = resourceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Resource not found with id: " + id));

        // Check code uniqueness if changed
        if (request.getCode() != null && !request.getCode().equals(existingResource.getCode())) {
            if (resourceRepository.findByCode(request.getCode()).isPresent()) {
                throw new RuntimeException("Resource with code " + request.getCode() + " already exists");
            }
        }

        resourceMapper.updateEntity(request, existingResource);

        if (request.getResourceTypeId() != null) {
            ResourceType resourceType = resourceTypeRepository.findById(Objects.requireNonNull(request.getResourceTypeId()))
                    .orElseThrow(() -> new RuntimeException("Resource type not found"));
            existingResource.setResourceType(resourceType);
        }

        Resource updatedResource = resourceRepository.save(Objects.requireNonNull(existingResource));
        log.info("Resource updated successfully with id: {}", updatedResource.getId());

        return resourceMapper.toResponse(updatedResource);
    }

    @CacheEvict(value = {"resources", "resources-all"}, allEntries = true)
    public void deleteResource(@NonNull UUID id) {
        log.debug("Deleting resource with id: {}", id);

        if (!resourceRepository.existsById(id)) {
            throw new RuntimeException("Resource not found with id: " + id);
        }

        resourceRepository.deleteById(id);
        log.info("Resource deleted successfully with id: {}", id);
    }

    public List<ResourceResponse> getAvailableResources(UUID typeId, String status) {
        log.debug("Fetching available resources with filters - typeId: {}, status: {}", typeId, status);

        List<Resource> resources;
        if (typeId != null) {
            resources = resourceRepository.findWithFilters(typeId, status, null, null, Pageable.unpaged()).getContent();
        } else if (status != null) {
            resources = resourceRepository.findByStatus(status);
        } else {
            resources = resourceRepository.findAll();
        }

        return resources.stream()
                .map(resourceMapper::toResponse)
                .toList();
    }

    @CacheEvict(value = {"resources", "resources-all"}, allEntries = true)
    public ResourceResponse updateResourceStatus(@NonNull UUID id, String status) {
        log.debug("Updating resource status - id: {}, status: {}", id, status);

        Resource resource = resourceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Resource not found with id: " + id));

        resource.setStatus(status);
        Resource updatedResource = resourceRepository.save(resource);

        log.info("Resource status updated successfully - id: {}, status: {}", id, status);
        return resourceMapper.toResponse(updatedResource);
    }
}
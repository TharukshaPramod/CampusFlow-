package com.campusflow.service.impl;

import com.campusflow.dto.ResourceRequest;
import com.campusflow.dto.ResourceResponse;
import com.campusflow.exception.ResourceNotFoundException;
import com.campusflow.model.Resource;
import com.campusflow.model.ResourceType;
import com.campusflow.repository.ResourceRepository;
import com.campusflow.repository.ResourceTypeRepository;
import com.campusflow.service.ResourceService;
import com.campusflow.util.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ResourceServiceImpl implements ResourceService {

    private final ResourceRepository resourceRepository;
    private final ResourceTypeRepository resourceTypeRepository;

    @Override
    public ResourceResponse createResource(ResourceRequest request, String createdBy) {

        ResourceType resourceType = null;
        if (request.getResourceTypeId() != null) {
            resourceType = resourceTypeRepository.findById(request.getResourceTypeId())
                    .orElseThrow(() -> new ResourceNotFoundException(
                            "Resource type not found with id: " + request.getResourceTypeId()));
        }

        Resource resource = Resource.builder()
                .name(request.getName())
                .code(request.getCode())
                .description(request.getDescription())
                .location(request.getLocation())
                .building(request.getBuilding())
                .floor(request.getFloor())
                .capacity(request.getCapacity())
                .status(request.getStatus() != null ? request.getStatus() : "ACTIVE")
                .resourceType(resourceType)
                .availableDays(request.getAvailableDays())
                .availableFrom(request.getAvailableFrom())
                .availableTo(request.getAvailableTo())
                .images(request.getImages())
                .metadata(request.getMetadata())
                .requiresApproval(request.getRequiresApproval() != null ? request.getRequiresApproval() : false)
                .createdBy(createdBy)
                .updatedBy(createdBy)
                .build();

        return toResponse(resourceRepository.save(resource));
    }

    @Override
    public ResourceResponse getResourceById(UUID id) {
        Resource resource = resourceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Resource not found with id: " + id));
        return toResponse(resource);
    }

    @Override
    public List<ResourceResponse> getAllResources() {
        return resourceRepository.findAll()
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<ResourceResponse> searchResources(
            String status,
            String building,
            String location,
            Integer minCapacity,
            UUID resourceTypeId,
            Boolean requiresApproval) {

        return resourceRepository.searchResources(
                status, building, location, minCapacity, resourceTypeId, requiresApproval)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    public ResourceResponse updateResource(UUID id, ResourceRequest request, String updatedBy) {

        Resource resource = resourceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Resource not found with id: " + id));

        if (request.getResourceTypeId() != null) {
            ResourceType resourceType = resourceTypeRepository.findById(request.getResourceTypeId())
                    .orElseThrow(() -> new ResourceNotFoundException(
                            "Resource type not found with id: " + request.getResourceTypeId()));
            resource.setResourceType(resourceType);
        }

        resource.setName(request.getName());
        resource.setCode(request.getCode());
        resource.setDescription(request.getDescription());
        resource.setLocation(request.getLocation());
        resource.setBuilding(request.getBuilding());
        resource.setFloor(request.getFloor());
        resource.setCapacity(request.getCapacity());
        if (request.getStatus() != null)
            resource.setStatus(request.getStatus());
        resource.setAvailableDays(request.getAvailableDays());
        resource.setAvailableFrom(request.getAvailableFrom());
        resource.setAvailableTo(request.getAvailableTo());
        resource.setImages(request.getImages());
        resource.setMetadata(request.getMetadata());
        if (request.getRequiresApproval() != null)
            resource.setRequiresApproval(request.getRequiresApproval());
        resource.setUpdatedBy(updatedBy);

        return toResponse(resourceRepository.save(resource));
    }

    @Override
    public void deleteResource(UUID id) {
        if (!resourceRepository.existsById(id)) {
            throw new ResourceNotFoundException("Resource not found with id: " + id);
        }
        resourceRepository.deleteById(id);
    }

    private ResourceResponse toResponse(Resource r) {
        ResourceResponse.ResourceTypeDto resourceTypeDto = null;
        if (r.getResourceType() != null) {
            resourceTypeDto = ResourceResponse.ResourceTypeDto.builder()
                    .id(r.getResourceType().getId())
                    .name(r.getResourceType().getName())
                    .category(r.getResourceType().getCategory())
                    .icon(r.getResourceType().getIcon())
                    .build();
        }

        return ResourceResponse.builder()
                .id(r.getId())
                .name(r.getName())
                .code(r.getCode())
                .description(r.getDescription())
                .location(r.getLocation())
                .building(r.getBuilding())
                .floor(r.getFloor())
                .capacity(r.getCapacity())
                .status(r.getStatus())
                .resourceType(resourceTypeDto)
                .availableDays(r.getAvailableDays())
                .availableFrom(r.getAvailableFrom())
                .availableTo(r.getAvailableTo())
                .images(r.getImages())
                .metadata(r.getMetadata())
                .requiresApproval(r.getRequiresApproval())
                .createdAt(r.getCreatedAt())
                .updatedAt(r.getUpdatedAt())
                .createdBy(r.getCreatedBy())
                .updatedBy(r.getUpdatedBy())
                .build();
    }
}
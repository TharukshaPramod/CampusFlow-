package com.campusflow.service;

import com.campusflow.dto.ResourceRequest;
import com.campusflow.dto.ResourceResponse;

import java.util.List;
import java.util.UUID;

public interface ResourceService {

    ResourceResponse createResource(ResourceRequest request, String createdBy);

    ResourceResponse getResourceById(UUID id);

    List<ResourceResponse> getAllResources();

    List<ResourceResponse> searchResources(
            String status,
            String building,
            String location,
            Integer minCapacity,
            UUID resourceTypeId,
            Boolean requiresApproval
    );

    ResourceResponse updateResource(UUID id, ResourceRequest request, String updatedBy);

    void deleteResource(UUID id);
}
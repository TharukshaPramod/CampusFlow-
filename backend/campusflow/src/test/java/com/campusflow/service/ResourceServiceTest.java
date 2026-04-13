package com.campusflow.service;

import com.campusflow.dto.ResourceRequest;
import com.campusflow.dto.ResourceResponse;
import com.campusflow.exception.ResourceNotFoundException;
import com.campusflow.model.Resource;
import com.campusflow.model.ResourceType;
import com.campusflow.repository.ResourceRepository;
import com.campusflow.repository.ResourceTypeRepository;
import com.campusflow.service.impl.ResourceServiceImpl;
import com.campusflow.util.SecurityUtils;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockedStatic;
import org.mockito.MockitoAnnotations;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class ResourceServiceTest {

    @Mock
    private ResourceRepository resourceRepository;

    @Mock
    private ResourceTypeRepository resourceTypeRepository;

    @InjectMocks
    private ResourceServiceImpl resourceService;

    private UUID testId;
    private ResourceType testResourceType;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        testId = UUID.randomUUID();
        testResourceType = ResourceType.builder()
                .id(UUID.randomUUID())
                .name("Laboratory")
                .category("ROOM")
                .build();
    }

    @Test
    void createResource_shouldReturnSavedResource() {
        try (MockedStatic<SecurityUtils> mockedStatic = mockStatic(SecurityUtils.class)) {
            mockedStatic.when(SecurityUtils::getCurrentUserEmail).thenReturn("admin@campus.com");

            ResourceRequest request = new ResourceRequest();
            request.setName("Lab A");
            request.setStatus("ACTIVE");
            request.setLocation("Block C");
            request.setCapacity(30);

            Resource saved = Resource.builder()
                    .id(testId)
                    .name("Lab A")
                    .status("ACTIVE")
                    .location("Block C")
                    .capacity(30)
                    .requiresApproval(false)
                    .createdBy("admin@campus.com")
                    .resourceType(testResourceType)
                    .build();

            when(resourceRepository.save(any(Resource.class))).thenReturn(saved);

            ResourceResponse response = resourceService.createResource(request, testResourceType.getId().toString());

            assertEquals("Lab A", response.getName());
            assertEquals("ACTIVE", response.getStatus());
            assertEquals("admin@campus.com", response.getCreatedBy());
        }
    }

    @Test
    void getResourceById_shouldReturnResource() {
        Resource resource = Resource.builder()
                .id(testId)
                .name("Meeting Room 1")
                .status("ACTIVE")
                .build();

        when(resourceRepository.findById(testId)).thenReturn(Optional.of(resource));

        ResourceResponse response = resourceService.getResourceById(testId);

        assertEquals("Meeting Room 1", response.getName());
    }

    @Test
    void getResourceById_notFound_shouldThrow() {
        when(resourceRepository.findById(testId)).thenReturn(Optional.empty());
        assertThrows(ResourceNotFoundException.class,
                () -> resourceService.getResourceById(testId));
    }

    @Test
    void getAllResources_shouldReturnList() {
        Resource r1 = Resource.builder().id(UUID.randomUUID()).name("Lab A").status("ACTIVE").build();
        Resource r2 = Resource.builder().id(UUID.randomUUID()).name("Lab B").status("ACTIVE").build();

        when(resourceRepository.findAll()).thenReturn(List.of(r1, r2));

        List<ResourceResponse> responses = resourceService.getAllResources();

        assertEquals(2, responses.size());
    }

    @Test
    void updateResource_shouldReturnUpdatedResource() {
        try (MockedStatic<SecurityUtils> mockedStatic = mockStatic(SecurityUtils.class)) {
            mockedStatic.when(SecurityUtils::getCurrentUserEmail).thenReturn("admin@campus.com");

            ResourceRequest request = new ResourceRequest();
            request.setName("Lab A Updated");
            request.setStatus("MAINTENANCE");
            request.setLocation("Block D");
            request.setCapacity(40);

            Resource existing = Resource.builder()
                    .id(testId)
                    .name("Lab A")
                    .status("ACTIVE")
                    .build();

            Resource updated = Resource.builder()
                    .id(testId)
                    .name("Lab A Updated")
                    .status("MAINTENANCE")
                    .location("Block D")
                    .capacity(40)
                    .updatedBy("admin@campus.com")
                    .build();

            when(resourceRepository.findById(testId)).thenReturn(Optional.of(existing));
            when(resourceRepository.save(any(Resource.class))).thenReturn(updated);

            ResourceResponse response = resourceService.updateResource(testId, request,
                    testResourceType.getId().toString());

            assertEquals("Lab A Updated", response.getName());
            assertEquals("MAINTENANCE", response.getStatus());
        }
    }

    @Test
    void deleteResource_notFound_shouldThrow() {
        when(resourceRepository.existsById(testId)).thenReturn(false);
        assertThrows(ResourceNotFoundException.class,
                () -> resourceService.deleteResource(testId));
    }

    @Test
    void deleteResource_shouldCallDeleteById() {
        when(resourceRepository.existsById(testId)).thenReturn(true);
        resourceService.deleteResource(testId);
        verify(resourceRepository, times(1)).deleteById(testId);
    }
}
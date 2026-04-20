package com.sliit.campusflow.modules.admin.service.impl;

import com.sliit.campusflow.modules.admin.dto.ResourceAnalyticsResponse;
import com.sliit.campusflow.modules.admin.service.ResourceAnalyticsService;
import com.sliit.campusflow.modules.resources.model.Resource;
import com.sliit.campusflow.modules.resources.repository.ResourceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ResourceAnalyticsServiceImpl implements ResourceAnalyticsService {

    private final ResourceRepository resourceRepository;

    @Override
    public ResourceAnalyticsResponse getResourceAnalytics() {
        List<Resource> allResources = resourceRepository.findAll();

        // Status counts
        long total = allResources.size();
        long active = allResources.stream().filter(r -> "ACTIVE".equals(r.getStatus())).count();
        long outOfSvc = allResources.stream().filter(r -> "OUT_OF_SERVICE".equals(r.getStatus())).count();
        long maintenance = allResources.stream().filter(r -> "MAINTENANCE".equals(r.getStatus())).count();
        long inactive = allResources.stream().filter(r -> "INACTIVE".equals(r.getStatus())).count();

        // Resources by type - handle lazy loading properly
        List<ResourceAnalyticsResponse.TypeCount> byType = allResources.stream()
                .filter(r -> r.getResourceType() != null)
                .collect(Collectors.groupingBy(
                        r -> {
                            try {
                                return r.getResourceType().getName();
                            } catch (Exception e) {
                                return "Unknown";
                            }
                        },
                        Collectors.toList()))
                .entrySet().stream()
                .map(e -> {
                    String typeName = e.getKey();
                    String category = e.getValue().stream()
                            .filter(r -> r.getResourceType() != null)
                            .findFirst()
                            .map(r -> {
                                try {
                                    return r.getResourceType().getCategory();
                                } catch (Exception ex) {
                                    return "";
                                }
                            })
                            .orElse("");
                    return ResourceAnalyticsResponse.TypeCount.builder()
                            .typeName(typeName)
                            .category(category)
                            .count((long) e.getValue().size())
                            .build();
                })
                .sorted((a, b) -> Long.compare(b.getCount(), a.getCount()))
                .collect(Collectors.toList());

        // Resources by building
        List<ResourceAnalyticsResponse.BuildingCount> byBuilding = allResources.stream()
                .filter(r -> r.getBuilding() != null && !r.getBuilding().isBlank())
                .collect(Collectors.groupingBy(Resource::getBuilding, Collectors.counting()))
                .entrySet().stream()
                .map(e -> ResourceAnalyticsResponse.BuildingCount.builder()
                        .building(e.getKey())
                        .count(e.getValue())
                        .build())
                .sorted((a, b) -> Long.compare(b.getCount(), a.getCount()))
                .collect(Collectors.toList());

        // Currently under active maintenance
        List<ResourceAnalyticsResponse.MaintenanceItem> currentMaintenance = new ArrayList<>();

        // Approval counts
        long requiresApproval = allResources.stream()
                .filter(r -> r.getRequiresApproval() != null && r.getRequiresApproval())
                .count();
        long noApprovalRequired = total - requiresApproval;

        return ResourceAnalyticsResponse.builder()
                .totalResources(total)
                .activeResources(active)
                .outOfServiceResources(outOfSvc)
                .maintenanceResources(maintenance)
                .inactiveResources(inactive)
                .resourcesByType(byType)
                .resourcesByBuilding(byBuilding)
                .currentlyUnderMaintenance(currentMaintenance)
                .requiresApprovalCount(requiresApproval)
                .noApprovalRequiredCount(noApprovalRequired)
                .build();
    }
}

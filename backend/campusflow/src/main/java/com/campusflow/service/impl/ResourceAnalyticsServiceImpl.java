package com.campusflow.service.impl;

import com.campusflow.dto.ResourceAnalyticsResponse;
import com.campusflow.model.Resource;
import com.campusflow.model.ResourceMaintenanceSchedule;
import com.campusflow.repository.ResourceMaintenanceScheduleRepository;
import com.campusflow.repository.ResourceRepository;
import com.campusflow.service.ResourceAnalyticsService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ResourceAnalyticsServiceImpl implements ResourceAnalyticsService {

    private final ResourceRepository resourceRepository;
    private final ResourceMaintenanceScheduleRepository maintenanceRepository;

    @Override
    public ResourceAnalyticsResponse getResourceAnalytics() {
        List<Resource> allResources = resourceRepository.findAll();

        // Status counts
        long total       = allResources.size();
        long active      = allResources.stream().filter(r -> "ACTIVE".equals(r.getStatus())).count();
        long outOfSvc    = allResources.stream().filter(r -> "OUT_OF_SERVICE".equals(r.getStatus())).count();
        long maintenance = allResources.stream().filter(r -> "MAINTENANCE".equals(r.getStatus())).count();
        long inactive    = allResources.stream().filter(r -> "INACTIVE".equals(r.getStatus())).count();

        // Resources by type
        List<ResourceAnalyticsResponse.TypeCount> byType = allResources.stream()
                .filter(r -> r.getResourceType() != null)
                .collect(Collectors.groupingBy(
                        r -> r.getResourceType().getName(),
                        Collectors.counting()
                ))
                .entrySet().stream()
                .map(e -> {
                    String typeName = e.getKey();
                    String category = allResources.stream()
                            .filter(r -> r.getResourceType() != null
                                    && typeName.equals(r.getResourceType().getName()))
                            .findFirst()
                            .map(r -> r.getResourceType().getCategory())
                            .orElse("");
                    return ResourceAnalyticsResponse.TypeCount.builder()
                            .typeName(typeName)
                            .category(category)
                            .count(e.getValue())
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
        List<ResourceAnalyticsResponse.MaintenanceItem> currentMaintenance =
                maintenanceRepository.findActiveMaintenanceForResource(null, LocalDate.now())
                        .stream()
                        .map(m -> ResourceAnalyticsResponse.MaintenanceItem.builder()
                                .resourceId(m.getResource() != null ? m.getResource().getId().toString() : "")
                                .resourceName(m.getResource() != null ? m.getResource().getName() : "Unknown")
                                .building(m.getResource() != null ? m.getResource().getBuilding() : "")
                                .location(m.getResource() != null ? m.getResource().getLocation() : "")
                                .startDate(m.getStartDate() != null ? m.getStartDate().toString() : "")
                                .endDate(m.getEndDate() != null ? m.getEndDate().toString() : "Ongoing")
                                .maintenanceStatus(m.getStatus())
                                .build())
                        .collect(Collectors.toList());

        // Approval counts
        long requiresApproval   = allResources.stream().filter(r -> Boolean.TRUE.equals(r.getRequiresApproval())).count();
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
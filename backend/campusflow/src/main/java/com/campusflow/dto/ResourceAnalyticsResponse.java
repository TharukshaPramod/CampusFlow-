package com.campusflow.dto;

import lombok.Builder;
import lombok.Data;
import java.util.List;
import java.util.Map;

@Data
@Builder
public class ResourceAnalyticsResponse {

    // Summary counts
    private long totalResources;
    private long activeResources;
    private long outOfServiceResources;
    private long maintenanceResources;
    private long inactiveResources;

    // Resources per type
    private List<TypeCount> resourcesByType;

    // Resources per building
    private List<BuildingCount> resourcesByBuilding;

    // Resources currently under active maintenance
    private List<MaintenanceItem> currentlyUnderMaintenance;

    // Requires approval breakdown
    private long requiresApprovalCount;
    private long noApprovalRequiredCount;

    @Data
    @Builder
    public static class TypeCount {
        private String typeName;
        private String category;
        private long count;
    }

    @Data
    @Builder
    public static class BuildingCount {
        private String building;
        private long count;
    }

    @Data
    @Builder
    public static class MaintenanceItem {
        private String resourceId;
        private String resourceName;
        private String building;
        private String location;
        private String startDate;
        private String endDate;
        private String maintenanceStatus;
    }
}
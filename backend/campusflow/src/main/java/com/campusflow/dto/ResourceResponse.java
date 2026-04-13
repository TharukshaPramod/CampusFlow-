package com.campusflow.dto;

import lombok.Builder;
import lombok.Data;
import java.time.LocalTime;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Data
@Builder
public class ResourceResponse {

    private UUID id;
    private String name;
    private String code;
    private String description;
    private String location;
    private String building;
    private String floor;
    private Integer capacity;
    private String status;
    private ResourceTypeDto resourceType;
    private List<String> availableDays;
    private LocalTime availableFrom;
    private LocalTime availableTo;
    private List<String> images;
    private Map<String, Object> metadata;
    private Boolean requiresApproval;
    private OffsetDateTime createdAt;
    private OffsetDateTime updatedAt;
    private String createdBy;
    private String updatedBy;

    @Data
    @Builder
    public static class ResourceTypeDto {
        private UUID id;
        private String name;
        private String category;
        private String icon;
    }
}
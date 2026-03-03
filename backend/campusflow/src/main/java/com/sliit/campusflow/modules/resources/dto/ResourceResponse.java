package com.sliit.campusflow.modules.resources.dto;

import lombok.Data;

import java.time.Instant;
import java.time.LocalTime;
import java.util.List;
import java.util.UUID;

@Data
public class ResourceResponse {
    private UUID id;
    private String name;
    private String description;
    private ResourceTypeDto resourceType;
    private String code;
    private Integer capacity;
    private String location;
    private String floor;
    private String building;
    private String status;
    private Object metadata;
    private List<String> images;
    private LocalTime availableFrom;
    private LocalTime availableTo;
    private List<Integer> availableDays;
    private Boolean requiresApproval;
    private Instant createdAt;
    private Instant updatedAt;

    @Data
    public static class ResourceTypeDto {
        private UUID id;
        private String name;
        private String category;
        private String icon;
    }
}
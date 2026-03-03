package com.sliit.campusflow.modules.resources.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalTime;
import java.util.List;
import java.util.UUID;

@Data
public class ResourceRequest {

    @NotBlank(message = "Resource name is required")
    private String name;

    private String description;

    @NotNull(message = "Resource type ID is required")
    private UUID resourceTypeId;

    private String code;

    @Min(value = 0, message = "Capacity must be positive")
    private Integer capacity;

    private String location;

    private String floor;

    private String building;

    @NotBlank(message = "Status is required")
    private String status;

    private Object metadata;

    private List<String> images;

    private LocalTime availableFrom;

    private LocalTime availableTo;

    private List<Integer> availableDays;

    private Boolean requiresApproval;
}
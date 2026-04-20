package com.campusflow.dto;

import jakarta.validation.constraints.*;
import lombok.Data;
import java.time.LocalTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Data
public class ResourceRequest {

    @NotBlank(message = "Name is required")
    private String name;

    private String code;

    private String description;

    private String location;

    private String building;

    private String floor;

    @Min(value = 1, message = "Capacity must be at least 1")
    private Integer capacity;

    @NotBlank(message = "Status is required")
    private String status;

    private UUID resourceTypeId;

    private List<String> availableDays;

    private LocalTime availableFrom;

    private LocalTime availableTo;

    private List<String> images;

    private Map<String, Object> metadata;

    private Boolean requiresApproval;
}
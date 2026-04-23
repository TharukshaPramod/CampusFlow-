package com.sliit.campusflow.modules.resources.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.time.LocalTime;
import java.util.List;
import java.util.UUID;

@Data
public class ResourceRequest {

    @NotBlank(message = "Resource name is required")
    @Size(min = 3, max = 100, message = "Resource name must be between 3 and 100 characters")
    private String name;

    @Size(max = 1000, message = "Description must be 1000 characters or less")
    private String description;

    @NotNull(message = "Resource type ID is required")
    private UUID resourceTypeId;

    @Pattern(regexp = "^[A-Z0-9-]{3,30}$", message = "Code must be 3-30 chars using A-Z, 0-9 and '-' only")
    private String code;

    @Min(value = 1, message = "Capacity must be at least 1")
    private Integer capacity;

    @Size(max = 255, message = "Location must be 255 characters or less")
    private String location;

    @Size(max = 50, message = "Floor must be 50 characters or less")
    private String floor;

    @Size(max = 100, message = "Building must be 100 characters or less")
    private String building;

    @NotBlank(message = "Status is required")
    @Pattern(regexp = "^(ACTIVE|OUT_OF_SERVICE|MAINTENANCE|INACTIVE)$", message = "Status must be ACTIVE, OUT_OF_SERVICE, MAINTENANCE, or INACTIVE")
    private String status;

    private Object metadata;

    private List<String> images;

    private LocalTime availableFrom;

    private LocalTime availableTo;

    private List<Integer> availableDays;

    private Boolean requiresApproval;

    @jakarta.validation.constraints.AssertTrue(message = "Available From must be earlier than Available To")
    public boolean isAvailableTimeRangeValid() {
        if (availableFrom == null || availableTo == null) {
            return true;
        }
        return availableFrom.isBefore(availableTo);
    }

    @jakarta.validation.constraints.AssertTrue(message = "Both Available From and Available To must be provided together")
    public boolean isAvailabilityPairValid() {
        return (availableFrom == null && availableTo == null) || (availableFrom != null && availableTo != null);
    }

    @jakarta.validation.constraints.AssertTrue(message = "Available days must be values between 1 and 7")
    public boolean isAvailableDaysValid() {
        if (availableDays == null) {
            return true;
        }
        return availableDays.stream().allMatch(day -> day != null && day >= 1 && day <= 7);
    }
}
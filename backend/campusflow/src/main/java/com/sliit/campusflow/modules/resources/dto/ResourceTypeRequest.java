package com.sliit.campusflow.modules.resources.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class ResourceTypeRequest {

    @NotBlank(message = "Resource type name is required")
    private String name;

    private String description;

    @NotBlank(message = "Category is required")
    private String category;

    private String icon;
}
package com.sliit.campusflow.modules.resources.dto;

import lombok.Data;

import java.time.Instant;
import java.util.UUID;

@Data
public class ResourceTypeResponse {
    private UUID id;
    private String name;
    private String description;
    private String category;
    private String icon;
    private Instant createdAt;
    private Instant updatedAt;
    private Long resourceCount;
}
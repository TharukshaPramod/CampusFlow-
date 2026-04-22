package com.sliit.campusflow.modules.ai.dto;

import lombok.Data;

@Data
public class AiResolutionRequest {
    private String title;
    private String description;
    private String category;
    private String priority;
    private String location;
}

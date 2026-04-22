package com.sliit.campusflow.modules.ai.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AiTriageResponse {
    private String suggestedCategory;
    private String suggestedPriority;
    private String reasoning;
}

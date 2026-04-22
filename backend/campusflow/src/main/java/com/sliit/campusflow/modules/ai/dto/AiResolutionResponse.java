package com.sliit.campusflow.modules.ai.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AiResolutionResponse {
    private List<String> steps;
    private String estimatedTime;
    private String additionalNotes;
}

package com.sliit.campusflow.modules.ai.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AiSummarizeResponse {
    private String summary;
    private String sentiment;
    private String actionRequired;
}

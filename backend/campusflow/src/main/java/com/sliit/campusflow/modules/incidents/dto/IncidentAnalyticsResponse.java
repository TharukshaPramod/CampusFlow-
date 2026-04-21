package com.sliit.campusflow.modules.incidents.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class IncidentAnalyticsResponse {
    private long totalIncidents;
    private long openIncidents;
    private long inProgressIncidents;
    private long resolvedIncidents;
    private long rejectedIncidents;
    private long closedIncidents;
    
    private Map<String, Long> statusDistribution;
    private Map<String, Long> priorityDistribution;
    private Map<String, Long> categoryDistribution;
    
    private Double averageResolutionTimeHours;
}

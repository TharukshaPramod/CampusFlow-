package com.sliit.campusflow.modules.incidents.dto;

import com.sliit.campusflow.modules.incidents.model.IncidentPriority;
import lombok.Data;
import java.util.UUID;

@Data
public class IncidentUpdateRequest {
    private String title;
    private String category;
    private String description;
    private IncidentPriority priority;
    private String preferredContact;
    private UUID resourceId;
    private String location;
}

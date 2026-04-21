package com.sliit.campusflow.modules.incidents.dto;

import com.sliit.campusflow.modules.incidents.model.IncidentPriority;
import lombok.Data;

import java.util.List;
import java.util.UUID;

@Data
public class IncidentCreateRequest {
    private String title;
    private String category;
    private String description;
    private IncidentPriority priority;
    private String preferredContact;
    private UUID resourceId;
    private String location;
    
    // Max 3 images in base64 format
    private List<String> attachmentsBase64;
}

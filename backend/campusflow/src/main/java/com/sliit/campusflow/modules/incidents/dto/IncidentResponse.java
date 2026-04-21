package com.sliit.campusflow.modules.incidents.dto;

import com.sliit.campusflow.modules.incidents.model.IncidentPriority;
import com.sliit.campusflow.modules.incidents.model.IncidentStatus;
import lombok.Data;

import java.time.Instant;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Data
public class IncidentResponse {
    private UUID id;
    private String ticketNumber;
    private String title;
    private String category;
    private String description;
    private IncidentPriority priority;
    private IncidentStatus status;
    private String preferredContact;
    
    private UUID creatorId;
    private String creatorName;

    private UUID technicianId;
    private String technicianName;

    private UUID resourceId;
    private String resourceName;
    
    private String location;
    private String resolutionNotes;
    private String rejectionReason;

    private LocalDateTime firstResponseAt;
    private LocalDateTime resolvedAt;
    
    private Instant createdAt;
    private Instant updatedAt;

    private List<IncidentAttachmentResponse> attachments;
    private List<IncidentCommentResponse> comments;
}

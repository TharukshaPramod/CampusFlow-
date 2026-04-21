package com.sliit.campusflow.modules.incidents.dto;

import com.sliit.campusflow.modules.incidents.model.IncidentStatus;
import lombok.Data;

@Data
public class IncidentStatusUpdate {
    private IncidentStatus status;
    private String rejectionReason;
    private String resolutionNotes;
}

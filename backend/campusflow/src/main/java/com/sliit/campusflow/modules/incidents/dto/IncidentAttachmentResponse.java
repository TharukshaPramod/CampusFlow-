package com.sliit.campusflow.modules.incidents.dto;

import lombok.Data;
import java.util.UUID;
import java.time.Instant;

@Data
public class IncidentAttachmentResponse {
    private UUID id;
    private String fileUrl;
    private String fileName;
    private Instant createdAt;
}

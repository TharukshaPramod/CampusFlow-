package com.sliit.campusflow.modules.incidents.dto;

import lombok.Data;
import java.util.UUID;
import java.time.Instant;

@Data
public class IncidentCommentResponse {
    private UUID id;
    private UUID authorId;
    private String authorName;
    private String content;
    private Instant createdAt;
    private Instant updatedAt;
}

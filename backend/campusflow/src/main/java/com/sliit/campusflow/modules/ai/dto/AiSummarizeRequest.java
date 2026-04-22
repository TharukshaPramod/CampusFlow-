package com.sliit.campusflow.modules.ai.dto;

import lombok.Data;
import java.util.List;

@Data
public class AiSummarizeRequest {
    private String incidentTitle;
    private String incidentDescription;
    private List<CommentEntry> comments;

    @Data
    public static class CommentEntry {
        private String author;
        private String content;
        private String timestamp;
    }
}

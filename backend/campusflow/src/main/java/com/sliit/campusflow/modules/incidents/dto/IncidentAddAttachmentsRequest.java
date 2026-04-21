package com.sliit.campusflow.modules.incidents.dto;

import lombok.Data;
import java.util.List;

@Data
public class IncidentAddAttachmentsRequest {
    private List<String> attachmentsBase64;
}

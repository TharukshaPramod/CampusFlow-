package com.sliit.campusflow.modules.incidents.controller;

import com.sliit.campusflow.modules.auth.model.User;
import com.sliit.campusflow.modules.incidents.dto.*;
import com.sliit.campusflow.modules.incidents.service.IncidentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/incidents")
@RequiredArgsConstructor
@Tag(name = "Incidents", description = "Endpoints for managing maintenance and support incidents")
@CrossOrigin(origins = "*", maxAge = 3600)
public class IncidentController {

    private final IncidentService incidentService;

    @PostMapping
    @Operation(summary = "Create a new incident ticket")
    public ResponseEntity<IncidentResponse> createIncident(
            @AuthenticationPrincipal User user,
            @RequestBody IncidentCreateRequest request) {
        return ResponseEntity.ok(incidentService.createIncident(user.getId(), request));
    }

    @GetMapping
    @Operation(summary = "Get incidents (Admin/Tech gets all, Users get theirs)")
    public ResponseEntity<List<IncidentResponse>> getIncidents(
            @AuthenticationPrincipal User user) {
        
        boolean isStaff = user.getRoles().stream().anyMatch(r -> r.getName().equals("ROLE_ADMIN") || r.getName().equals("ADMIN"));
        // Assuming 'STAFF' or 'TECHNICIAN' roles might exist, treating ADMIN as staff for now.
        
        if (isStaff) {
            return ResponseEntity.ok(incidentService.getAllIncidents());
        } else {
            return ResponseEntity.ok(incidentService.getUserIncidents(user.getId()));
        }
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get incident by ID")
    public ResponseEntity<IncidentResponse> getIncident(@PathVariable UUID id) {
        // In real world, add owner check here. For simplicity, assume UI routes carefully.
        return ResponseEntity.ok(incidentService.getIncidentById(id));
    }

    @GetMapping("/analytics")
    @Operation(summary = "Get global incident analytics")
    public ResponseEntity<IncidentAnalyticsResponse> getAnalytics() {
        return ResponseEntity.ok(incidentService.getAnalytics());
    }

    @GetMapping("/{id}/report/pdf")
    @Operation(summary = "Download a PDF report for a specific incident")
    public ResponseEntity<byte[]> downloadPdfReport(@PathVariable UUID id) {
        byte[] pdfBytes = incidentService.generatePdfReport(id);
        
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_PDF);
        headers.setContentDispositionFormData("attachment", "Incident_" + id.toString() + "_Report.pdf");

        return ResponseEntity.ok()
                .headers(headers)
                .body(pdfBytes);
    }

    @PatchMapping("/{id}/status")
    @Operation(summary = "Update incident status (Tech/Admin only)")
    public ResponseEntity<IncidentResponse> updateStatus(
            @PathVariable UUID id,
            @AuthenticationPrincipal User user,
            @RequestBody IncidentStatusUpdate update) {
        return ResponseEntity.ok(incidentService.updateIncidentStatus(id, update, user));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update incident (Creator/Admin)")
    public ResponseEntity<IncidentResponse> updateIncident(
            @PathVariable UUID id,
            @AuthenticationPrincipal User user,
            @RequestBody IncidentUpdateRequest request) {
        return ResponseEntity.ok(incidentService.updateIncident(id, request, user));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete incident (Creator/Admin)")
    public ResponseEntity<Void> deleteIncident(
            @PathVariable UUID id,
            @AuthenticationPrincipal User user) {
        incidentService.deleteIncident(id, user);
        return ResponseEntity.ok().build();
    }

    @PatchMapping("/{id}/assign")
    @Operation(summary = "Assign a technician to an incident")
    public ResponseEntity<IncidentResponse> assignTechnician(
            @PathVariable UUID id,
            @RequestParam UUID technicianId) {
        // Should verify caller is Admin
        return ResponseEntity.ok(incidentService.assignTechnician(id, technicianId));
    }

    @PostMapping("/{id}/comments")
    @Operation(summary = "Add a comment to the incident")
    public ResponseEntity<IncidentCommentResponse> addComment(
            @PathVariable UUID id,
            @AuthenticationPrincipal User user,
            @RequestBody IncidentCommentRequest request) {
        return ResponseEntity.ok(incidentService.addComment(id, user.getId(), request));
    }

    @PutMapping("/comments/{commentId}")
    @Operation(summary = "Edit a comment")
    public ResponseEntity<IncidentCommentResponse> editComment(
            @PathVariable UUID commentId,
            @AuthenticationPrincipal User user,
            @RequestBody IncidentCommentRequest request) {
        return ResponseEntity.ok(incidentService.editComment(commentId, user, request));
    }

    @DeleteMapping("/comments/{commentId}")
    @Operation(summary = "Delete a comment")
    public ResponseEntity<Void> deleteComment(
            @PathVariable UUID commentId,
            @AuthenticationPrincipal User user) {
        incidentService.deleteComment(commentId, user);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{id}/attachments")
    @Operation(summary = "Add evidence attachments to an incident")
    public ResponseEntity<List<IncidentAttachmentResponse>> addAttachments(
            @PathVariable UUID id,
            @AuthenticationPrincipal User user,
            @RequestBody IncidentAddAttachmentsRequest request) {
        return ResponseEntity.ok(incidentService.addAttachments(id, request, user));
    }

    @DeleteMapping("/attachments/{attachmentId}")
    @Operation(summary = "Delete an attachment")
    public ResponseEntity<Void> deleteAttachment(
            @PathVariable UUID attachmentId,
            @AuthenticationPrincipal User user) {
        incidentService.deleteAttachment(attachmentId, user);
        return ResponseEntity.ok().build();
    }
}

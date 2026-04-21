package com.sliit.campusflow.modules.incidents.service;

import com.sliit.campusflow.infrastructure.storage.SupabaseStorageService;
import com.sliit.campusflow.modules.auth.model.User;
import com.sliit.campusflow.modules.auth.repository.UserRepository;
import com.sliit.campusflow.modules.incidents.dto.*;
import com.sliit.campusflow.modules.incidents.mapper.IncidentMapper;
import com.sliit.campusflow.modules.incidents.model.*;
import com.sliit.campusflow.modules.incidents.repository.*;
import com.sliit.campusflow.modules.resources.model.Resource;
import com.sliit.campusflow.modules.resources.repository.ResourceRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Objects;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class IncidentService {

    private final IncidentRepository incidentRepository;
    private final IncidentAttachmentRepository attachmentRepository;
    private final IncidentCommentRepository commentRepository;
    private final UserRepository userRepository;
    private final ResourceRepository resourceRepository;
    private final SupabaseStorageService storageService;
    private final IncidentMapper incidentMapper;

    private static final String INCIDENT_BUCKET = "incidents";

    public IncidentResponse createIncident(UUID userId, IncidentCreateRequest request) {
        User creator = userRepository.findById(Objects.requireNonNull(userId))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        Incident incident = new Incident();
        incident.setTicketNumber("INC-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
        incident.setTitle(request.getTitle());
        incident.setCategory(request.getCategory());
        incident.setDescription(request.getDescription());
        incident.setPriority(request.getPriority() != null ? request.getPriority() : IncidentPriority.LOW);
        incident.setStatus(IncidentStatus.OPEN);
        incident.setPreferredContact(request.getPreferredContact());
        incident.setCreator(creator);
        incident.setLocation(request.getLocation());

        if (request.getResourceId() != null) {
            Resource resource = resourceRepository.findById(Objects.requireNonNull(request.getResourceId()))
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Resource not found"));
            incident.setResource(resource);
        }

        final Incident savedIncident = incidentRepository.save(incident);

        // Handle Attachments
        if (request.getAttachmentsBase64() != null && !request.getAttachmentsBase64().isEmpty()) {
            if (request.getAttachmentsBase64().size() > 3) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Maximum 3 attachments allowed per incident");
            }

            for (String base64Data : request.getAttachmentsBase64()) {
                try {
                    String fileUrl = storageService.uploadBase64Image(base64Data, INCIDENT_BUCKET);
                    IncidentAttachment attachment = new IncidentAttachment();
                    attachment.setIncident(savedIncident);
                    attachment.setFileUrl(fileUrl);
                    attachment.setFileName("attachment_" + UUID.randomUUID().toString().substring(0, 6));
                    attachmentRepository.save(attachment);
                } catch (Exception e) {
                    log.error("Failed to upload attachment", e);
                    throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Failed to process image attachment(s)");
                }
            }
        }

        return getIncidentById(savedIncident.getId());
    }

    public List<IncidentResponse> getAllIncidents() {
        return incidentRepository.findAll().stream()
                .map(this::enrichIncidentWithRelations)
                .collect(Collectors.toList());
    }

    public List<IncidentResponse> getUserIncidents(UUID userId) {
        return incidentRepository.findByCreatorId(userId).stream()
                .map(this::enrichIncidentWithRelations)
                .collect(Collectors.toList());
    }

    public IncidentResponse getIncidentById(UUID id) {
        Incident incident = incidentRepository.findById(Objects.requireNonNull(id))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Incident not found"));
        return enrichIncidentWithRelations(incident);
    }

    public IncidentResponse updateIncidentStatus(UUID id, IncidentStatusUpdate update, User currentUser) {
        Incident incident = incidentRepository.findById(Objects.requireNonNull(id))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Incident not found"));

        boolean isAdmin = currentUser.getRoles().stream().anyMatch(r -> r.getName().equals("ROLE_ADMIN") || r.getName().equals("ADMIN"));
        boolean isTechnician = incident.getTechnician() != null && incident.getTechnician().getId().equals(currentUser.getId());

        if (!isAdmin && !isTechnician) {
             throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Not authorized to update this incident's status");
        }

        IncidentStatus prevStatus = incident.getStatus();
        incident.setStatus(update.getStatus());

        if (update.getStatus() == IncidentStatus.REJECTED) {
            incident.setRejectionReason(update.getRejectionReason());
        }

        if (update.getStatus() == IncidentStatus.RESOLVED || update.getStatus() == IncidentStatus.CLOSED) {
            incident.setResolutionNotes(update.getResolutionNotes());
            if (incident.getResolvedAt() == null) {
                incident.setResolvedAt(LocalDateTime.now());
            }
        }

        if (update.getStatus() == IncidentStatus.IN_PROGRESS && prevStatus == IncidentStatus.OPEN) {
            if (incident.getFirstResponseAt() == null) {
                incident.setFirstResponseAt(LocalDateTime.now()); // SLA tracking
            }
        }

        Incident saved = incidentRepository.save(incident);
        return enrichIncidentWithRelations(saved);
    }

    public IncidentResponse updateIncident(UUID id, IncidentUpdateRequest request, User currentUser) {
        Incident incident = incidentRepository.findById(Objects.requireNonNull(id))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Incident not found"));

        boolean isAdmin = currentUser.getRoles().stream().anyMatch(r -> r.getName().equals("ROLE_ADMIN") || r.getName().equals("ADMIN"));
        
        if (!isAdmin && !incident.getCreator().getId().equals(currentUser.getId())) {
             throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only the creator or an Admin can edit this incident");
        }

        if (request.getTitle() != null) incident.setTitle(request.getTitle());
        if (request.getCategory() != null) incident.setCategory(request.getCategory());
        if (request.getDescription() != null) incident.setDescription(request.getDescription());
        if (request.getPriority() != null) incident.setPriority(request.getPriority());
        if (request.getPreferredContact() != null) incident.setPreferredContact(request.getPreferredContact());
        if (request.getLocation() != null) incident.setLocation(request.getLocation());

        if (request.getResourceId() != null) {
            Resource resource = resourceRepository.findById(Objects.requireNonNull(request.getResourceId()))
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Resource not found"));
            incident.setResource(resource);
        }

        return enrichIncidentWithRelations(incidentRepository.save(Objects.requireNonNull(incident)));
    }

    public void deleteIncident(UUID id, User currentUser) {
        Incident incident = incidentRepository.findById(Objects.requireNonNull(id))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Incident not found"));

        boolean isAdmin = currentUser.getRoles().stream().anyMatch(r -> r.getName().equals("ROLE_ADMIN") || r.getName().equals("ADMIN"));
        
        if (!isAdmin && !incident.getCreator().getId().equals(currentUser.getId())) {
             throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only the creator or an Admin can delete this incident");
        }

        incidentRepository.delete(Objects.requireNonNull(incident));
    }

    public IncidentResponse assignTechnician(UUID incidentId, UUID technicianId) {
        Incident incident = incidentRepository.findById(Objects.requireNonNull(incidentId))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Incident not found"));
        
        User technician = userRepository.findById(Objects.requireNonNull(technicianId))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Technician not found"));

        incident.setTechnician(technician);
        return enrichIncidentWithRelations(incidentRepository.save(incident));
    }

    public IncidentCommentResponse addComment(UUID incidentId, UUID userId, IncidentCommentRequest request) {
        Incident incident = incidentRepository.findById(Objects.requireNonNull(incidentId))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Incident not found"));

        User author = userRepository.findById(Objects.requireNonNull(userId))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        IncidentComment comment = new IncidentComment();
        comment.setIncident(incident);
        comment.setAuthor(author);
        comment.setContent(request.getContent());

        return incidentMapper.toCommentResponse(commentRepository.save(comment));
    }

    public IncidentCommentResponse editComment(UUID commentId, User currentUser, IncidentCommentRequest request) {
        IncidentComment comment = commentRepository.findById(Objects.requireNonNull(commentId))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Comment not found"));

        if (!comment.getAuthor().getId().equals(currentUser.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You can only edit your own comments");
        }

        if (request.getContent() != null && !request.getContent().trim().isEmpty()) {
            comment.setContent(request.getContent());
        }
        
        return incidentMapper.toCommentResponse(commentRepository.save(comment));
    }

    public void deleteComment(UUID commentId, User currentUser) {
        IncidentComment comment = commentRepository.findById(Objects.requireNonNull(commentId))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Comment not found"));

        boolean isAdmin = currentUser.getRoles().stream().anyMatch(r -> r.getName().equals("ROLE_ADMIN") || r.getName().equals("ADMIN"));
        
        if (!isAdmin && !comment.getAuthor().getId().equals(currentUser.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You can only delete your own comments");
        }

        commentRepository.delete(Objects.requireNonNull(comment));
    }

    public List<IncidentAttachmentResponse> addAttachments(UUID incidentId, IncidentAddAttachmentsRequest request, User currentUser) {
        Incident incident = incidentRepository.findById(Objects.requireNonNull(incidentId))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Incident not found"));

        boolean isAdmin = currentUser.getRoles().stream().anyMatch(r -> r.getName().equals("ROLE_ADMIN") || r.getName().equals("ADMIN"));
        if (!isAdmin && !incident.getCreator().getId().equals(currentUser.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only the creator or Admin can add evidence");
        }

        if (request.getAttachmentsBase64() == null || request.getAttachmentsBase64().isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "No attachments provided");
        }

        List<IncidentAttachment> existing = attachmentRepository.findByIncidentId(incident.getId());
        if (existing.size() + request.getAttachmentsBase64().size() > 3) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Maximum 3 attachments allowed per incident");
        }

        for (String base64Data : request.getAttachmentsBase64()) {
            try {
                String fileUrl = storageService.uploadBase64Image(base64Data, INCIDENT_BUCKET);
                IncidentAttachment attachment = new IncidentAttachment();
                attachment.setIncident(incident);
                attachment.setFileUrl(fileUrl);
                attachment.setFileName("attachment_" + UUID.randomUUID().toString().substring(0, 6));
                attachmentRepository.save(attachment);
            } catch (Exception e) {
                log.error("Failed to upload supplementary attachment", e);
                throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Failed to process image attachment(s)");
            }
        }

        return incidentMapper.toAttachmentResponseList(attachmentRepository.findByIncidentId(incident.getId()));
    }

    public void deleteAttachment(UUID attachmentId, User currentUser) {
        IncidentAttachment attachment = attachmentRepository.findById(Objects.requireNonNull(attachmentId))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Attachment not found"));

        boolean isAdmin = currentUser.getRoles().stream().anyMatch(r -> r.getName().equals("ROLE_ADMIN") || r.getName().equals("ADMIN"));
        if (!isAdmin && !attachment.getIncident().getCreator().getId().equals(currentUser.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only the creator or Admin can delete evidence");
        }

        attachmentRepository.delete(Objects.requireNonNull(attachment));
    }

    private IncidentResponse enrichIncidentWithRelations(Incident incident) {
        IncidentResponse response = incidentMapper.toResponse(incident);
        
        List<IncidentAttachment> attachments = attachmentRepository.findByIncidentId(incident.getId());
        response.setAttachments(incidentMapper.toAttachmentResponseList(attachments));

        List<IncidentComment> comments = commentRepository.findByIncidentIdOrderByCreatedAtAsc(Objects.requireNonNull(incident.getId()));
        response.setComments(incidentMapper.toCommentResponseList(comments));

        return response;
    }
}

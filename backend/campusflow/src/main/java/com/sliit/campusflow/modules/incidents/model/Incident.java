package com.sliit.campusflow.modules.incidents.model;

import com.sliit.campusflow.common.model.BaseEntity;
import com.sliit.campusflow.modules.auth.model.User;
import com.sliit.campusflow.modules.resources.model.Resource;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "incidents")
@Getter
@Setter
public class Incident extends BaseEntity {

    @Column(name = "ticket_number", nullable = false, unique = true, length = 50)
    private String ticketNumber; // format: INC-XXXXXXX

    @Column(nullable = false)
    private String title;

    @Column(nullable = false)
    private String category; // e.g., HARDWARE, SOFTWARE, PLUMBING, HVAC

    @Column(columnDefinition = "TEXT", nullable = false)
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private IncidentPriority priority = IncidentPriority.LOW;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private IncidentStatus status = IncidentStatus.OPEN;

    @Column(name = "preferred_contact")
    private String preferredContact;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "creator_id", nullable = false)
    private User creator;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "technician_id")
    private User technician; // Currently assigned support tech

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "resource_id")
    private Resource resource; // Optional link to physical asset

    @Column(name = "location")
    private String location; // Fallback if no specific resource

    @Column(columnDefinition = "TEXT", name = "resolution_notes")
    private String resolutionNotes;

    @Column(columnDefinition = "TEXT", name = "rejection_reason")
    private String rejectionReason;

    // SLA Timers
    @Column(name = "sla_first_response_at")
    private LocalDateTime firstResponseAt;

    @Column(name = "sla_resolved_at")
    private LocalDateTime resolvedAt;

}

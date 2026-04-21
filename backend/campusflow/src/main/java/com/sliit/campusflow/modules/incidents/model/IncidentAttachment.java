package com.sliit.campusflow.modules.incidents.model;

import com.sliit.campusflow.common.model.BaseEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "incident_attachments")
@Getter
@Setter
public class IncidentAttachment extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "incident_id", nullable = false)
    private Incident incident;

    @Column(name = "file_url", nullable = false, length = 1000)
    private String fileUrl; // Supabase public URL

    @Column(name = "file_name")
    private String fileName;

}

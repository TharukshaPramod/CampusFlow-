package com.sliit.campusflow.modules.incidents.repository;

import com.sliit.campusflow.modules.incidents.model.IncidentAttachment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface IncidentAttachmentRepository extends JpaRepository<IncidentAttachment, UUID> {
    List<IncidentAttachment> findByIncidentId(UUID incidentId);
    void deleteByIncidentId(UUID incidentId);
}

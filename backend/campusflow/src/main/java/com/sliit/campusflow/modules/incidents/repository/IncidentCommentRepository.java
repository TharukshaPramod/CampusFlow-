package com.sliit.campusflow.modules.incidents.repository;

import com.sliit.campusflow.modules.incidents.model.IncidentComment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface IncidentCommentRepository extends JpaRepository<IncidentComment, UUID> {
    List<IncidentComment> findByIncidentIdOrderByCreatedAtAsc(UUID incidentId);
    long countByAuthorId(UUID authorId);
}

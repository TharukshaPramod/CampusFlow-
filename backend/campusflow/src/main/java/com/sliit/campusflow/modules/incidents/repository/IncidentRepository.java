package com.sliit.campusflow.modules.incidents.repository;

import com.sliit.campusflow.modules.incidents.model.Incident;
import com.sliit.campusflow.modules.incidents.model.IncidentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface IncidentRepository extends JpaRepository<Incident, UUID> {
    List<Incident> findByCreatorId(UUID creatorId);
    List<Incident> findByTechnicianId(UUID technicianId);
    List<Incident> findByStatus(IncidentStatus status);
    long countByCreatorId(UUID creatorId);
    long countByTechnicianId(UUID technicianId);
}

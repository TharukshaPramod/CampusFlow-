package com.campusflow.repository;

import com.campusflow.model.ResourceMaintenanceSchedule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Repository
public interface ResourceMaintenanceScheduleRepository extends JpaRepository<ResourceMaintenanceSchedule, UUID> {

    List<ResourceMaintenanceSchedule> findByResource_Id(UUID resourceId);

    List<ResourceMaintenanceSchedule> findByStatus(String status);

    // Check if a resource has active maintenance on a given date
    @Query("SELECT m FROM ResourceMaintenanceSchedule m WHERE " +
       "(:resourceId IS NULL OR m.resource.id = :resourceId) AND " +
       "m.status NOT IN ('COMPLETED', 'CANCELLED') AND " +
       "m.startDate <= :date AND " +
       "(m.endDate IS NULL OR m.endDate >= :date)")
    List<ResourceMaintenanceSchedule> findActiveMaintenanceForResource(
        @Param("resourceId") UUID resourceId,
        @Param("date") LocalDate date
    );
}
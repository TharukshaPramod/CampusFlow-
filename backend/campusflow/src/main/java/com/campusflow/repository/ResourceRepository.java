package com.campusflow.repository;

import com.campusflow.model.Resource;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ResourceRepository extends JpaRepository<Resource, UUID> {

    Optional<Resource> findByCode(String code);

    List<Resource> findByStatus(String status);

    List<Resource> findByBuilding(String building);

    List<Resource> findByResourceType_Id(UUID resourceTypeId);

    List<Resource> findByResourceType_Category(String category);

    @Query("SELECT r FROM Resource r WHERE " +
           "(:status IS NULL OR r.status = :status) AND " +
           "(:building IS NULL OR LOWER(r.building) LIKE LOWER(CONCAT('%', :building, '%'))) AND " +
           "(:location IS NULL OR LOWER(r.location) LIKE LOWER(CONCAT('%', :location, '%'))) AND " +
           "(:minCapacity IS NULL OR r.capacity >= :minCapacity) AND " +
           "(:resourceTypeId IS NULL OR r.resourceType.id = :resourceTypeId) AND " +
           "(:requiresApproval IS NULL OR r.requiresApproval = :requiresApproval)")
    List<Resource> searchResources(
            @Param("status") String status,
            @Param("building") String building,
            @Param("location") String location,
            @Param("minCapacity") Integer minCapacity,
            @Param("resourceTypeId") UUID resourceTypeId,
            @Param("requiresApproval") Boolean requiresApproval
    );
}
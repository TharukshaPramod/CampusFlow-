package com.sliit.campusflow.modules.resources.repository;

import com.sliit.campusflow.modules.resources.model.Resource;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ResourceRepository extends JpaRepository<Resource, UUID>, JpaSpecificationExecutor<Resource> {

    Optional<Resource> findByCode(String code);

    List<Resource> findByStatus(String status);

    @Query("SELECT r FROM Resource r WHERE " +
           "(:typeId IS NULL OR r.resourceType.id = :typeId) AND " +
           "(:status IS NULL OR r.status = :status) AND " +
           "(:minCapacity IS NULL OR r.capacity >= :minCapacity) AND " +
           "(:building IS NULL OR LOWER(r.building) LIKE LOWER(CONCAT('%', :building, '%')))")
    Page<Resource> findWithFilters(
            @Param("typeId") UUID typeId,
            @Param("status") String status,
            @Param("minCapacity") Integer minCapacity,
            @Param("building") String building,
            Pageable pageable);
}
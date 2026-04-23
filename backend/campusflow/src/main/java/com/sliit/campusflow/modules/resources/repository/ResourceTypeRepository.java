package com.sliit.campusflow.modules.resources.repository;

import com.sliit.campusflow.modules.resources.model.ResourceType;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ResourceTypeRepository extends JpaRepository<ResourceType, UUID> {

    Optional<ResourceType> findByName(String name);

    Optional<ResourceType> findByNameIgnoreCase(String name);

    List<ResourceType> findByCategory(String category);

    @Query("SELECT rt FROM ResourceType rt WHERE " +
            "LOWER(rt.name) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
            "LOWER(rt.description) LIKE LOWER(CONCAT('%', :searchTerm, '%'))")
    Page<ResourceType> search(@Param("searchTerm") String searchTerm, Pageable pageable);

    @Modifying
    @Query("DELETE FROM ResourceType rt WHERE rt.id = :id")
    int deleteByIdDirect(@Param("id") UUID id);

    boolean existsByName(String name);
}
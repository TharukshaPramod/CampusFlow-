package com.campusflow.repository;

import com.campusflow.model.ResourceType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ResourceTypeRepository extends JpaRepository<ResourceType, UUID> {

    Optional<ResourceType> findByName(String name);

    List<ResourceType> findByCategory(String category);
}
package com.campusflow.repository;

import com.campusflow.model.ResourceFeature;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ResourceFeatureRepository extends JpaRepository<ResourceFeature, UUID> {

    List<ResourceFeature> findByResource_Id(UUID resourceId);

    List<ResourceFeature> findByFeatureName(String featureName);

    void deleteByResource_Id(UUID resourceId);
}
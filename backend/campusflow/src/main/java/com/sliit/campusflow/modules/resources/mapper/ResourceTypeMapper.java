package com.sliit.campusflow.modules.resources.mapper;

import com.sliit.campusflow.modules.resources.dto.ResourceTypeRequest;
import com.sliit.campusflow.modules.resources.dto.ResourceTypeResponse;
import com.sliit.campusflow.modules.resources.model.ResourceType;
import org.mapstruct.*;

import java.util.List;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface ResourceTypeMapper {

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "createdBy", ignore = true)
    @Mapping(target = "updatedBy", ignore = true)
    @Mapping(target = "version", ignore = true)
    @Mapping(target = "resources", ignore = true)
    ResourceType toEntity(ResourceTypeRequest request);

    @Mapping(target = "resourceCount", ignore = true)
    ResourceTypeResponse toResponse(ResourceType resourceType);

    List<ResourceTypeResponse> toResponseList(List<ResourceType> resourceTypes);

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "createdBy", ignore = true)
    @Mapping(target = "updatedBy", ignore = true)
    @Mapping(target = "version", ignore = true)
    @Mapping(target = "resources", ignore = true)
    void updateEntity(ResourceTypeRequest request, @MappingTarget ResourceType resourceType);

    @AfterMapping
    default void setResourceCount(ResourceType resourceType, @MappingTarget ResourceTypeResponse response) {
        if (resourceType.getResources() != null) {
            response.setResourceCount((long) resourceType.getResources().size());
        } else {
            response.setResourceCount(0L);
        }
    }
}
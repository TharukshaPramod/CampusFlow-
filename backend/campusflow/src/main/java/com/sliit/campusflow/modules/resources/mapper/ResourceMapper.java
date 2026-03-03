package com.sliit.campusflow.modules.resources.mapper;

import com.sliit.campusflow.modules.resources.dto.ResourceRequest;
import com.sliit.campusflow.modules.resources.dto.ResourceResponse;
import com.sliit.campusflow.modules.resources.model.Resource;
import org.mapstruct.*;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface ResourceMapper {

    @Mapping(target = "resourceType", ignore = true)
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "createdBy", ignore = true)
    @Mapping(target = "updatedBy", ignore = true)
    @Mapping(target = "version", ignore = true)
    Resource toEntity(ResourceRequest request);

    @Mapping(target = "resourceType", source = "resourceType")
    ResourceResponse toResponse(Resource resource);

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "resourceType", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "createdBy", ignore = true)
    @Mapping(target = "updatedBy", ignore = true)
    @Mapping(target = "version", ignore = true)
    void updateEntity(ResourceRequest request, @MappingTarget Resource resource);

    default ResourceResponse.ResourceTypeDto mapResourceType(com.sliit.campusflow.modules.resources.model.ResourceType resourceType) {
        if (resourceType == null) return null;
        ResourceResponse.ResourceTypeDto dto = new ResourceResponse.ResourceTypeDto();
        dto.setId(resourceType.getId());
        dto.setName(resourceType.getName());
        dto.setCategory(resourceType.getCategory());
        dto.setIcon(resourceType.getIcon());
        return dto;
    }
}
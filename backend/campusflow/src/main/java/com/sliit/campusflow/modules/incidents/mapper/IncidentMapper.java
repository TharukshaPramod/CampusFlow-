package com.sliit.campusflow.modules.incidents.mapper;

import com.sliit.campusflow.modules.incidents.dto.IncidentAttachmentResponse;
import com.sliit.campusflow.modules.incidents.dto.IncidentCommentResponse;
import com.sliit.campusflow.modules.incidents.dto.IncidentResponse;
import com.sliit.campusflow.modules.incidents.model.Incident;
import com.sliit.campusflow.modules.incidents.model.IncidentAttachment;
import com.sliit.campusflow.modules.incidents.model.IncidentComment;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.NullValuePropertyMappingStrategy;
import org.mapstruct.ReportingPolicy;

import java.util.List;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE, nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
public interface IncidentMapper {

    @Mapping(source = "creator.id", target = "creatorId")
    @Mapping(source = "creator.name", target = "creatorName")
    @Mapping(source = "technician.id", target = "technicianId")
    @Mapping(source = "technician.name", target = "technicianName")
    @Mapping(source = "resource.id", target = "resourceId")
    @Mapping(source = "resource.name", target = "resourceName")
    IncidentResponse toResponse(Incident incident);

    List<IncidentResponse> toResponseList(List<Incident> incidents);

    IncidentAttachmentResponse toAttachmentResponse(IncidentAttachment attachment);
    List<IncidentAttachmentResponse> toAttachmentResponseList(List<IncidentAttachment> attachments);

    @Mapping(source = "author.id", target = "authorId")
    @Mapping(source = "author.name", target = "authorName")
    IncidentCommentResponse toCommentResponse(IncidentComment comment);
    List<IncidentCommentResponse> toCommentResponseList(List<IncidentComment> comments);
}

package com.sliit.campusflow.modules.incidents.mapper;

import org.mapstruct.factory.Mappers;
import org.springframework.boot.autoconfigure.condition.ConditionalOnMissingBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class IncidentMapperConfiguration {

    @Bean
    @ConditionalOnMissingBean(IncidentMapper.class)
    public IncidentMapper incidentMapper() {
        return Mappers.getMapper(IncidentMapper.class);
    }
}

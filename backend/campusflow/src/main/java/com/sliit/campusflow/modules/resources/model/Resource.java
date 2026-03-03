package com.sliit.campusflow.modules.resources.model;

import com.sliit.campusflow.common.model.BaseEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.LocalTime;
import java.util.List;

@Entity
@Table(name = "resources")
@Getter
@Setter
public class Resource extends BaseEntity {

    @Column(nullable = false)
    private String name;

    private String description;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "resource_type_id")
    private ResourceType resourceType;

    @Column(unique = true)
    private String code;

    private Integer capacity;

    private String location;

    private String floor;

    private String building;

    @Column(nullable = false)
    private String status; // ACTIVE, OUT_OF_SERVICE, MAINTENANCE

    @JdbcTypeCode(SqlTypes.JSON)
    private Object metadata;

    @JdbcTypeCode(SqlTypes.ARRAY)
    private List<String> images;

    private LocalTime availableFrom;

    private LocalTime availableTo;

    @JdbcTypeCode(SqlTypes.ARRAY)
    private List<Integer> availableDays;

    private Boolean requiresApproval = true;
}
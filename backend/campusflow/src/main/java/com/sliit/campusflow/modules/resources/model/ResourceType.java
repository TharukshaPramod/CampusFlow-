package com.sliit.campusflow.modules.resources.model;

import com.sliit.campusflow.common.model.BaseEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "resource_types")
@Getter
@Setter
public class ResourceType extends BaseEntity {

    @Column(nullable = false, unique = true)
    private String name;

    private String description;

    @Column(nullable = false)
    private String category;

    private String icon;
}
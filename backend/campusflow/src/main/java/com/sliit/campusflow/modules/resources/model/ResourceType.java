package com.sliit.campusflow.modules.resources.model;

import com.sliit.campusflow.common.model.BaseEntity;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;

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

    @OneToMany(mappedBy = "resourceType", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnore
    private List<Resource> resources = new ArrayList<>();
}
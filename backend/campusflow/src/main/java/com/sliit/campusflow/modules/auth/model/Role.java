package com.sliit.campusflow.modules.auth.model;

import com.sliit.campusflow.common.model.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "roles")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Role extends BaseEntity {

    @Column(nullable = false, unique = true)
    private String name;

    private String description;
}

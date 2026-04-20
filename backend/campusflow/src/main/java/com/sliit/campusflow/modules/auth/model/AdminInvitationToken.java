package com.sliit.campusflow.modules.auth.model;

import com.sliit.campusflow.common.model.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "admin_invitation_tokens")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class AdminInvitationToken extends BaseEntity {

    @Column(nullable = false, unique = true)
    private String token;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String email;

    @Column(nullable = false)
    private String role;

    @Column(nullable = false)
    private Instant expiryDate;

    @Column(nullable = false)
    private boolean accepted = false;

    @Column(columnDefinition = "UUID")
    private UUID userId;
}

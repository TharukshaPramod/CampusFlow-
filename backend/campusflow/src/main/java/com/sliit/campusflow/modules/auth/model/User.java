package com.sliit.campusflow.modules.auth.model;

import com.sliit.campusflow.common.model.BaseEntity;
import jakarta.persistence.*;
import lombok.*;
import java.time.Instant;
import java.util.Arrays;
import java.util.HashSet;
import java.util.Set;
import java.util.stream.Collectors;

@Entity
@Table(name = "users")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User extends BaseEntity {
    
    @Column(unique = true, nullable = false)
    private String email;
    
    @Column(name = "password_hash")
    private String password;
    
    @Column(name = "first_name")
    private String name;  // Using first_name column but name field
    
    @Column(name = "profile_picture_url")
    private String picture;
    
    @Column(name = "provider")
    @Builder.Default
    private String authProvider = "LOCAL";
    
    @Column(name = "provider_id")
    private String googleId;
    
    @Column(name = "enabled")
    @Builder.Default
    private boolean active = true;
    
    @Column(name = "email_verified")
    @Builder.Default
    private boolean emailVerified = false;
    
    @Column(name = "last_login_at")
    private Instant lastLogin;
    
    @Column(name = "roles")
    @Builder.Default
    private String roles = "USER";
    
    @Transient
    public Set<String> getRoleSet() {
        if (roles == null || roles.isEmpty()) {
            return new HashSet<>(Set.of("USER"));
        }
        return Arrays.stream(roles.split(","))
                .map(String::trim)
                .collect(Collectors.toSet());
    }
    
    @Transient
    public void setRoleSet(Set<String> roleSet) {
        if (roleSet == null || roleSet.isEmpty()) {
            this.roles = "USER";
        } else {
            this.roles = String.join(",", roleSet);
        }
    }
}

package com.sliit.campusflow.modules.auth.repository;

import com.sliit.campusflow.modules.auth.model.AdminInvitationToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface AdminInvitationTokenRepository extends JpaRepository<AdminInvitationToken, UUID> {
    Optional<AdminInvitationToken> findByToken(String token);
    Optional<AdminInvitationToken> findFirstByEmailOrderByCreatedAtDesc(String email);
}

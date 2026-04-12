package com.sliit.campusflow.modules.auth.repository;

import com.sliit.campusflow.modules.auth.model.EmailVerificationToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface EmailVerificationTokenRepository extends JpaRepository<EmailVerificationToken, UUID> {
    Optional<EmailVerificationToken> findByUserIdAndCode(UUID userId, String code);
    void deleteByUserId(UUID userId);
}

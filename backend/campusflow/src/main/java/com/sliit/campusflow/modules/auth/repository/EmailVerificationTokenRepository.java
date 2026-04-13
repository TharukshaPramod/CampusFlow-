package com.sliit.campusflow.modules.auth.repository;

import com.sliit.campusflow.modules.auth.model.EmailVerificationToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface EmailVerificationTokenRepository extends JpaRepository<EmailVerificationToken, UUID> {
    Optional<EmailVerificationToken> findByUserIdAndCode(UUID userId, String code);

    @Modifying
    @Transactional
    void deleteByUserId(UUID userId);
}

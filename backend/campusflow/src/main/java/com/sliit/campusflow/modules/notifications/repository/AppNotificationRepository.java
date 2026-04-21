package com.sliit.campusflow.modules.notifications.repository;

import com.sliit.campusflow.modules.notifications.model.AppNotification;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface AppNotificationRepository extends JpaRepository<AppNotification, UUID> {
    List<AppNotification> findTop20ByUserIdAndArchivedFalseOrderByCreatedAtDesc(UUID userId);
    List<AppNotification> findByUserIdAndArchivedFalseOrderByCreatedAtDesc(UUID userId);
    long countByUserIdAndArchivedFalseAndReadFalse(UUID userId);
}

package com.sliit.campusflow.modules.notifications.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.sliit.campusflow.modules.auth.model.User;
import com.sliit.campusflow.modules.auth.repository.UserRepository;
import com.sliit.campusflow.modules.notifications.dto.NotificationResponse;
import com.sliit.campusflow.modules.notifications.model.AppNotification;
import com.sliit.campusflow.modules.notifications.repository.AppNotificationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class NotificationService {

    private final AppNotificationRepository notificationRepository;
    private final UserRepository userRepository;
    private final ObjectMapper objectMapper;

    @Transactional(readOnly = true)
    public List<NotificationResponse> getMyNotifications(UUID userId) {
        return notificationRepository.findTop20ByUserIdAndArchivedFalseOrderByCreatedAtDesc(userId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public long getMyUnreadCount(UUID userId) {
        return notificationRepository.countByUserIdAndArchivedFalseAndReadFalse(userId);
    }

    public void markAsRead(UUID userId, UUID notificationId) {
        AppNotification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Notification not found"));

        if (!notification.getUser().getId().equals(userId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Cannot modify this notification");
        }

        notification.setRead(true);
        notificationRepository.save(notification);
    }

    public void markAllAsRead(UUID userId) {
        List<AppNotification> notifications = notificationRepository.findByUserIdAndArchivedFalseOrderByCreatedAtDesc(userId);
        for (AppNotification notification : notifications) {
            notification.setRead(true);
        }
        notificationRepository.saveAll(notifications);
    }

    public void notifyUser(UUID userId, String type, String title, String message, UUID referenceId, String referenceType, String actionUrl) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        AppNotification notification = new AppNotification();
        notification.setUser(user);
        notification.setType(type);
        notification.setTitle(title);
        notification.setMessage(message);
        notification.setReferenceId(referenceId);
        notification.setReferenceType(referenceType);
        notification.setData(toDataJson(actionUrl));
        notification.setRead(false);
        notification.setArchived(false);
        notificationRepository.save(notification);
    }

    public void notifyAdmins(String type, String title, String message, UUID referenceId, String referenceType, String actionUrl) {
        List<User> admins = userRepository.findAllAdmins();
        for (User admin : admins) {
            notifyUser(admin.getId(), type, title, message, referenceId, referenceType, actionUrl);
        }
    }

    private NotificationResponse toResponse(AppNotification notification) {
        return NotificationResponse.builder()
                .id(notification.getId())
                .type(notification.getType())
                .title(notification.getTitle())
                .message(notification.getMessage())
                .read(notification.isRead())
                .createdAt(notification.getCreatedAt())
                .actionUrl(fromDataJson(notification.getData()))
                .build();
    }

    private String toDataJson(String actionUrl) {
        try {
            return objectMapper.writeValueAsString(java.util.Map.of("actionUrl", actionUrl));
        } catch (JsonProcessingException e) {
            return "{\"actionUrl\":\"/notifications\"}";
        }
    }

    private String fromDataJson(String data) {
        if (data == null || data.isBlank()) {
            return "/notifications";
        }
        try {
            JsonNode root = objectMapper.readTree(data);
            JsonNode actionUrl = root.get("actionUrl");
            if (actionUrl == null || actionUrl.asText().isBlank()) {
                return "/notifications";
            }
            return actionUrl.asText();
        } catch (Exception e) {
            return "/notifications";
        }
    }
}

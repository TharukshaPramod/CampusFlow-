package com.sliit.campusflow.modules.auth.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
@Slf4j
public class EmailService {

    @Autowired private JavaMailSender mailSender;

    public void sendPasswordResetEmail(String to, String resetLink) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(to);
            message.setSubject("CampusFlow - Password Reset");
            message.setText("Click the link to reset your password:\n\n" + resetLink + "\n\nLink expires in 1 hour.");
            mailSender.send(message);
            log.info("Password reset email sent to {}", to);
        } catch (Exception e) {
            log.error("Failed to send password reset email to {}: {}", to, e.getMessage());
        }
    }

    public void sendAdminInviteEmail(String to, String inviteToken, String role) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(to);
            message.setSubject("CampusFlow - Join as " + role);
            String inviteLink = "http://localhost:5173/auth/accept-invite?token=" + inviteToken + "&role=" + role;
            message.setText("You've been invited to join CampusFlow as a " + role + ".\n\n" + 
                          "Accept invitation:\n" + inviteLink);
            mailSender.send(message);
            log.info("Admin invite email sent to {}", to);
        } catch (Exception e) {
            log.error("Failed to send admin invite email to {}: {}", to, e.getMessage());
        }
    }
}

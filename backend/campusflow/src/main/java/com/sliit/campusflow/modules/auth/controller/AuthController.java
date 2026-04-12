package com.sliit.campusflow.modules.auth.controller;

import com.sliit.campusflow.modules.auth.dto.request.LoginRequest;
import com.sliit.campusflow.modules.auth.dto.request.RegisterRequest;
import com.sliit.campusflow.modules.auth.model.EmailVerificationToken;
import com.sliit.campusflow.modules.auth.model.PasswordResetToken;
import com.sliit.campusflow.modules.auth.model.User;
import com.sliit.campusflow.modules.auth.repository.EmailVerificationTokenRepository;
import com.sliit.campusflow.modules.auth.repository.PasswordResetTokenRepository;
import com.sliit.campusflow.modules.auth.repository.UserRepository;
import com.sliit.campusflow.modules.auth.security.JwtUtil;
import com.sliit.campusflow.modules.auth.service.EmailService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import java.time.Instant;
import java.security.SecureRandom;
import java.util.*;

@RestController
@RequestMapping("/api/auth")
@Slf4j
public class AuthController {

    @Autowired private UserRepository userRepository;
    @Autowired private PasswordResetTokenRepository tokenRepository;
    @Autowired private EmailVerificationTokenRepository emailVerificationTokenRepository;
    @Autowired private JwtUtil jwtUtil;
    @Autowired private PasswordEncoder passwordEncoder;
    @Autowired private EmailService emailService;

    private static final int EMAIL_CODE_LENGTH = 6;
    private static final int EMAIL_CODE_TTL_SECONDS = 600;
    private final SecureRandom secureRandom = new SecureRandom();

    /**
     * POST /api/auth/register
     * Open to everyone. Registers a new LOCAL user (role = USER).
     */
    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest req) {
        if (userRepository.existsByEmail(req.getEmail().toLowerCase())) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(Map.of("message", "Email already registered"));
        }

        User user = new User();
        user.setName(req.getName());
        user.setEmail(req.getEmail().toLowerCase());
        user.setPassword(passwordEncoder.encode(req.getPassword()));
        user.setAuthProvider("LOCAL");
        user.setRoles("USER");
        user.setActive(true);

        userRepository.save(user);
        String verificationCode = generateVerificationCode();
        EmailVerificationToken token = new EmailVerificationToken();
        token.setCode(verificationCode);
        token.setUser(user);
        token.setExpiryDate(Instant.now().plusSeconds(EMAIL_CODE_TTL_SECONDS));
        emailVerificationTokenRepository.deleteByUserId(user.getId());
        emailVerificationTokenRepository.save(token);
        emailService.sendVerificationCodeEmail(user.getEmail(), verificationCode);

        return ResponseEntity.status(HttpStatus.CREATED)
            .body(Map.of("message", "Verification code sent to email"));
    }

    /**
     * POST /api/auth/login
     * Works for LOCAL users and ADMIN accounts. Google OAuth users use /oauth2/authorization/google
     */
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest req) {
        var user = userRepository.findByEmail(req.getEmail().toLowerCase());
        
        if (user.isEmpty() || !passwordEncoder.matches(req.getPassword(), user.get().getPassword())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "Invalid email or password"));
        }

        User u = user.get();
        if (!u.isEmailVerified()) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                .body(Map.of("message", "Email not verified"));
        }
        if (!u.isActive()) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("message", "Account is inactive"));
        }

        u.setLastLogin(Instant.now());
        userRepository.save(u);

        String token = jwtUtil.generateToken(u);
        return ResponseEntity.ok(Map.of(
            "token", token,
            "user", Map.of(
                "id", u.getId(),
                "email", u.getEmail(),
                "name", u.getName(),
                "roles", u.getRoles()
            )
        ));
    }

    /**
     * POST /api/auth/verify-email
     * Public - verify email using OTP code
     */
    @PostMapping("/verify-email")
    public ResponseEntity<?> verifyEmail(@RequestBody Map<String, String> body) {
        String email = body.get("email");
        String code = body.get("code");

        if (email == null || email.isBlank() || code == null || code.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Email and code are required"));
        }

        var userOpt = userRepository.findByEmail(email.toLowerCase());
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", "User not found"));
        }

        User user = userOpt.get();
        if (user.isEmailVerified()) {
            return ResponseEntity.ok(Map.of("message", "Email already verified"));
        }

        var tokenOpt = emailVerificationTokenRepository.findByUserIdAndCode(user.getId(), code.trim());
        if (tokenOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "Invalid verification code"));
        }

        EmailVerificationToken token = tokenOpt.get();
        if (token.getExpiryDate() != null && token.getExpiryDate().isBefore(Instant.now())) {
            return ResponseEntity.status(HttpStatus.GONE)
                    .body(Map.of("message", "Verification code expired"));
        }

        user.setEmailVerified(true);
        userRepository.save(user);
        emailVerificationTokenRepository.deleteByUserId(user.getId());

        return ResponseEntity.ok(Map.of("message", "Email verified successfully"));
    }

    private String generateVerificationCode() {
        int min = (int) Math.pow(10, EMAIL_CODE_LENGTH - 1);
        int max = (int) Math.pow(10, EMAIL_CODE_LENGTH) - 1;
        int code = secureRandom.nextInt(max - min + 1) + min;
        return Integer.toString(code);
    }

    /**
     * POST /api/auth/forgot-password
     * Public - any user can request a reset link
     */
    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@RequestBody Map<String, String> body) {
        String email = body.get("email");
        var user = userRepository.findByEmail(email.toLowerCase());

        if (user.isEmpty()) {
            // Don't reveal if email exists
            return ResponseEntity.ok(Map.of("message", "If account exists, reset link will be sent"));
        }

        String resetToken = UUID.randomUUID().toString();
        PasswordResetToken token = new PasswordResetToken();
        token.setToken(resetToken);
        token.setUser(user.get());
        token.setExpiryDate(Instant.now().plusSeconds(3600));
        
        tokenRepository.deleteByUserId(user.get().getId());
        tokenRepository.save(token);

        String resetLink = "http://localhost:5173/reset-password?token=" + resetToken;
        emailService.sendPasswordResetEmail(email, resetLink);

        return ResponseEntity.ok(Map.of("message", "Reset link sent to email"));
    }

    /**
     * GET /api/auth/verify-token
     * Public - verify password reset token
     */
    @GetMapping("/verify-token")
    public ResponseEntity<?> verifyToken(@RequestParam String token) {
        var resetToken = tokenRepository.findByToken(token);

        if (resetToken.isEmpty() || resetToken.get().getExpiryDate().isBefore(Instant.now())) {
            return ResponseEntity.status(HttpStatus.GONE)
                    .body(Map.of("message", "Token expired or invalid"));
        }

        return ResponseEntity.ok(Map.of("email", resetToken.get().getUser().getEmail()));
    }

    /**
     * POST /api/auth/set-password
     * Public - set password using reset token
     */
    @PostMapping("/set-password")
    public ResponseEntity<?> setPassword(@RequestBody Map<String, String> body) {
        String token = body.get("token");
        String password = body.get("password");

        var resetToken = tokenRepository.findByToken(token);
        if (resetToken.isEmpty() || resetToken.get().getExpiryDate().isBefore(Instant.now())) {
            return ResponseEntity.status(HttpStatus.GONE)
                    .body(Map.of("message", "Token expired"));
        }

        User user = resetToken.get().getUser();
        user.setPassword(passwordEncoder.encode(password));
        userRepository.save(user);
        tokenRepository.deleteByUserId(user.getId());

        String jwtToken = jwtUtil.generateToken(user);
        return ResponseEntity.ok(Map.of(
            "token", jwtToken,
            "message", "Password set successfully"
        ));
    }

    /**
     * POST /api/auth/invite-admin
     * ADMIN only - invite a new admin by email
     */
    @PostMapping("/invite-admin")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> inviteAdmin(
            @RequestBody Map<String, String> body) {
        String email = body.get("email");
        String role = body.getOrDefault("role", "USER"); // ADMIN, TECHNICIAN, USER

        if (userRepository.existsByEmail(email.toLowerCase())) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(Map.of("message", "Email already exists"));
        }

        String inviteToken = UUID.randomUUID().toString();
        emailService.sendAdminInviteEmail(email, inviteToken, role);

        return ResponseEntity.ok(Map.of(
            "message", "Invitation sent to " + email,
            "token", inviteToken
        ));
    }
}

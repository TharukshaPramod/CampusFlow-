package com.sliit.campusflow.modules.auth.security;

import com.sliit.campusflow.modules.auth.model.User;
import com.sliit.campusflow.modules.auth.repository.UserRepository;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;
import java.io.IOException;
import java.time.Instant;
import java.util.Set;

@Component
@Slf4j
public class OAuth2AuthenticationSuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

    @Autowired private UserRepository userRepository;
    @Autowired private JwtUtil jwtUtil;

    @Value("${app.frontend.url:http://localhost:5173}")
    private String frontendUrl;

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request,
                                        HttpServletResponse response,
                                        Authentication authentication) throws IOException {
        try {
            OAuth2User oAuth2User = (OAuth2User) authentication.getPrincipal();
            String email = oAuth2User.getAttribute("email");
            String googleId = oAuth2User.getAttribute("sub");
            String name = oAuth2User.getAttribute("name");
            String picture = oAuth2User.getAttribute("picture");

            log.info("OAuth2 login for email: {}", email);

            if (email == null || email.isBlank()) {
                getRedirectStrategy().sendRedirect(request, response,
                        frontendUrl + "/login?error=google_email_not_available");
                return;
            }

            User existingUser = userRepository.findByEmail(email).orElse(null);
            if (existingUser != null && hasRestrictedRole(existingUser)) {
                log.warn("Blocked Google OAuth login for non-user role account: {}", email);
                getRedirectStrategy().sendRedirect(request, response,
                        frontendUrl + "/login?error=google_user_only");
                return;
            }

            User user = existingUser != null ? existingUser : userRepository.save(User.builder()
                        .googleId(googleId)
                        .email(email)
                        .name(name)
                        .picture(picture)
                        .authProvider("GOOGLE")
                        .password(null)
                        .roles("USER")
                        .active(true)
                        .build());

            if (user.getRoles() == null || user.getRoles().isBlank()) {
                user.setRoles("USER");
            }

            if (!user.isActive()) {
                getRedirectStrategy().sendRedirect(request, response,
                        frontendUrl + "/login?error=account_inactive");
                return;
            }

            if (googleId != null && !googleId.isBlank()) {
                user.setGoogleId(googleId);
            }
            if (user.getAuthProvider() == null || user.getAuthProvider().isBlank()) {
                user.setAuthProvider("GOOGLE");
            }

            user.setLastLogin(Instant.now());
            if (user.getName() == null) user.setName(name);
            if (user.getPicture() == null) user.setPicture(picture);
            user = userRepository.save(user);

            log.info("User saved: {}", user.getId());

            String token = jwtUtil.generateToken(user);
            log.info("JWT token generated successfully");
            
            String redirectUrl = frontendUrl + "/auth/callback?token=" + token;
            log.info("Redirecting to: {}", redirectUrl);
            getRedirectStrategy().sendRedirect(request, response, redirectUrl);
        } catch (Exception e) {
            log.error("OAuth2 authentication failed with exception", e);
            throw new IOException("OAuth2 authentication failed", e);
        }
    }

    private boolean hasRestrictedRole(User user) {
        Set<String> normalizedRoles = user.getRoleSet().stream()
                .map(role -> role.startsWith("ROLE_") ? role.substring(5) : role)
                .map(String::toUpperCase)
                .collect(java.util.stream.Collectors.toSet());

        return normalizedRoles.contains("ADMIN")
                || normalizedRoles.contains("TECHNICIAN")
                || normalizedRoles.contains("MANAGER");
    }
}

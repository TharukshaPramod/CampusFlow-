package com.sliit.campusflow.config;

import com.sliit.campusflow.modules.auth.model.Role;
import com.sliit.campusflow.modules.auth.model.User;
import com.sliit.campusflow.modules.auth.repository.RoleRepository;
import com.sliit.campusflow.modules.auth.repository.UserRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@Slf4j
public class AdminSeeder implements CommandLineRunner {

    private enum SeedResult {
        CREATED,
        UPDATED,
        SKIPPED
    }

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        try {
            SeedResult result = createAdminIfNotExists("System Admin", "tharuksha@gmail.com", "Admin@20");
            if (result == SeedResult.CREATED) {
                log.info("AdminSeeder completed successfully: admin account created");
            } else if (result == SeedResult.UPDATED) {
                log.info("AdminSeeder completed successfully: admin account synced");
            } else {
                log.info("AdminSeeder completed successfully: admin account already exists");
            }
        } catch (Exception e) {
            log.error("AdminSeeder failed", e);
        }
    }

    @SuppressWarnings("null")
    private SeedResult createAdminIfNotExists(String name, String email, String rawPassword) {
        String normalizedEmail = email.toLowerCase();
        Role adminRole;
        var adminRoleOpt = roleRepository.findByName("ROLE_ADMIN");
        if (adminRoleOpt.isPresent()) {
            adminRole = adminRoleOpt.get();
        } else {
            Role saved = roleRepository.save(
                    Role.builder()
                            .name("ROLE_ADMIN")
                            .description("System Admin")
                            .build());
            adminRole = java.util.Objects.requireNonNull(saved, "Failed to save ROLE_ADMIN");
        }

        var existingUser = userRepository.findByEmail(normalizedEmail);

        if (existingUser.isPresent()) {
            User user = existingUser.get();
            boolean changed = false;

            boolean hasAdminRole = user.getRoles().stream()
                    .anyMatch(role -> "ROLE_ADMIN".equalsIgnoreCase(role.getName()));
            if (!hasAdminRole) {
                user.getRoles().add(adminRole);
                changed = true;
            }

            if (!user.isActive()) {
                user.setActive(true);
                changed = true;
            }

            if (!user.isEmailVerified()) {
                user.setEmailVerified(true);
                changed = true;
            }

            if (user.getPassword() == null || user.getPassword().isBlank()) {
                user.setPassword(passwordEncoder.encode(rawPassword));
                changed = true;
            }

            if (changed) {
                userRepository.save(user);
                return SeedResult.UPDATED;
            }

            return SeedResult.SKIPPED;
        }

        User admin = new User();
        admin.setName(name);
        admin.setEmail(normalizedEmail);
        admin.setPassword(passwordEncoder.encode(rawPassword));
        admin.setAuthProvider("LOCAL");
        admin.setActive(true);
        admin.setEmailVerified(true);
        admin.getRoles().add(adminRole);

        userRepository.save(admin);
        return SeedResult.CREATED;
    }
}

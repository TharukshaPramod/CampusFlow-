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
@SuppressWarnings("null")
public class AdminSeeder implements CommandLineRunner {

    private enum SeedResult {
        CREATED,
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
            } else {
                log.info("AdminSeeder completed successfully: admin account already exists");
            }
        } catch (Exception e) {
            log.error("AdminSeeder failed", e);
        }
    }

    private SeedResult createAdminIfNotExists(String name, String email, String rawPassword) {
        String normalizedEmail = email.toLowerCase();
        var existingUser = userRepository.findByEmail(normalizedEmail);

        if (existingUser.isPresent()) {
            return SeedResult.SKIPPED;
        }

        Role adminRole = roleRepository.findByName("ROLE_ADMIN")
                .orElseGet(() -> roleRepository.save(
                        com.sliit.campusflow.modules.auth.model.Role.builder()
                                .name("ROLE_ADMIN")
                                .description("System Admin")
                                .build()));

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

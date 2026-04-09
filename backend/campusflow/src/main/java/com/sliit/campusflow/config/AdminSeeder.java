package com.sliit.campusflow.config;

import com.sliit.campusflow.modules.auth.model.User;
import com.sliit.campusflow.modules.auth.repository.UserRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@Slf4j
public class AdminSeeder implements CommandLineRunner {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        try {
            createAdminIfNotExists("System Admin", "admin@campusflow.edu", "Admin@2026");
            log.info("✅ AdminSeeder completed successfully");
        } catch (Exception e) {
            log.error("❌ AdminSeeder failed: {}", e.getMessage());
            e.printStackTrace();
        }
    }

    private void createAdminIfNotExists(String name, String email, String rawPassword) {
        try {
            var existingUser = userRepository.findByEmail(email.toLowerCase());
            
            if (existingUser.isPresent()) {
                User user = existingUser.get();
                if (user.getRoles() != null && user.getRoles().contains("ADMIN")) {
                    log.info("⏭️ Admin already exists: {}", email);
                    return;
                }
                user.setRoles("ADMIN");
                userRepository.save(user);
                log.info("✅ User promoted to ADMIN: {}", email);
                return;
            }

            User admin = new User();
            admin.setName(name);
            admin.setEmail(email.toLowerCase());
            admin.setPassword(passwordEncoder.encode(rawPassword));
            admin.setAuthProvider("LOCAL");
            admin.setRoles("ADMIN");
            admin.setActive(true);
            
            userRepository.save(admin);
            log.info("✅ Admin account created: {}", email);
        } catch (Exception e) {
            log.error("❌ Error creating admin: {}", e.getMessage());
        }
    }
}

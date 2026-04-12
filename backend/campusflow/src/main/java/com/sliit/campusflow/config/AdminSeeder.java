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
            createAdminIfNotExists("System Admin", "shivantha008@gmail.com", "Admin@20");
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
                // Keep seeded admin always login-ready for local auth flow.
                user.setRoles("ADMIN");
                user.setName(name);
                user.setAuthProvider("LOCAL");
                user.setActive(true);
                user.setEmailVerified(true);
                user.setPassword(passwordEncoder.encode(rawPassword));
                userRepository.save(user);
                log.info("✅ Existing user synced as ADMIN and verified: {}", email);
                return;
            }

            User admin = new User();
            admin.setName(name);
            admin.setEmail(email.toLowerCase());
            admin.setPassword(passwordEncoder.encode(rawPassword));
            admin.setAuthProvider("LOCAL");
            admin.setRoles("ADMIN");
            admin.setActive(true);
            admin.setEmailVerified(true);
            
            userRepository.save(admin);
            log.info("✅ Admin account created: {}", email);
        } catch (Exception e) {
            log.error("❌ Error creating admin: {}", e.getMessage());
        }
    }
}

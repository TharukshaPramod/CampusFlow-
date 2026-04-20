package com.sliit.campusflow.modules.auth.service;

import com.sliit.campusflow.modules.auth.model.User;
import com.sliit.campusflow.modules.auth.repository.EmailVerificationTokenRepository;
import com.sliit.campusflow.modules.auth.repository.PasswordResetTokenRepository;
import com.sliit.campusflow.modules.auth.repository.RoleRepository;
import com.sliit.campusflow.modules.auth.repository.UserRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.*;

@Service
@Slf4j
public class UserService {

    @Autowired private UserRepository userRepository;
    @Autowired private RoleRepository roleRepository;
    @Autowired private EmailVerificationTokenRepository emailVerificationTokenRepository;
    @Autowired private PasswordResetTokenRepository passwordResetTokenRepository;
    @Autowired private PasswordEncoder passwordEncoder;

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    public User getUserById(UUID id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("User not found"));
    }

    public User updateUserRoles(UUID id, Set<String> roles) {
        User user = getUserById(id);
        user.getRoles().clear();
        
        if (roles == null || roles.isEmpty()) {
            var role = roleRepository.findByName("ROLE_USER").orElseGet(() -> roleRepository.save(com.sliit.campusflow.modules.auth.model.Role.builder().name("ROLE_USER").description("Regular User").build()));
            user.getRoles().add(role);
        } else {
            for (String roleName : roles) {
                if (!roleName.startsWith("ROLE_")) {
                    roleName = "ROLE_" + roleName;
                }
                final String fRoleName = roleName;
                var role = roleRepository.findByName(fRoleName).orElseGet(() -> roleRepository.save(com.sliit.campusflow.modules.auth.model.Role.builder().name(fRoleName).build()));
                user.getRoles().add(role);
            }
        }
        return userRepository.save(user);
    }

    public User toggleUserStatus(UUID id) {
        User user = getUserById(id);
        user.setActive(!user.isActive());
        return userRepository.save(user);
    }

    public User updateUserByAdmin(UUID id, String name, String email, String password) {
        User user = getUserById(id);

        if (name != null && !name.trim().isEmpty()) {
            user.setName(name.trim());
        }

        if (email != null && !email.trim().isEmpty()) {
            String normalizedEmail = email.trim().toLowerCase();
            if (!normalizedEmail.equals(user.getEmail()) && userRepository.existsByEmail(normalizedEmail)) {
                throw new IllegalArgumentException("Email already registered");
            }
            user.setEmail(normalizedEmail);
        }

        if (password != null && !password.trim().isEmpty()) {
            user.setPassword(passwordEncoder.encode(password));
        }

        return userRepository.save(user);
    }

    public User updateCurrentUserProfile(UUID id, String name, String picture) {
        User user = getUserById(id);

        if (name != null) {
            String trimmedName = name.trim();
            if (!trimmedName.isEmpty()) {
                user.setName(trimmedName);
            }
        }

        if (picture != null) {
            String trimmedPicture = picture.trim();
            user.setPicture(trimmedPicture.isEmpty() ? null : trimmedPicture);
        }

        return userRepository.save(user);
    }

    @Transactional
    public void deleteUserByAdmin(UUID id) {
        User user = getUserById(id);
        emailVerificationTokenRepository.deleteByUserId(user.getId());
        passwordResetTokenRepository.deleteByUserId(user.getId());
        // Force child-row deletions before parent delete to satisfy FK constraints.
        emailVerificationTokenRepository.flush();
        passwordResetTokenRepository.flush();
        userRepository.delete(user);
        userRepository.flush();
    }
}

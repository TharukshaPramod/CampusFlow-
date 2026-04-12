package com.sliit.campusflow.modules.auth.controller;

import com.sliit.campusflow.modules.auth.dto.request.AdminUpdateUserRequest;
import com.sliit.campusflow.modules.auth.model.User;
import com.sliit.campusflow.modules.auth.service.UserService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController
@RequestMapping("/api/users")
@Slf4j
public class UserController {

    @Autowired private UserService userService;

    @GetMapping("/me")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<User> getCurrentUser(@AuthenticationPrincipal User currentUser) {
        return ResponseEntity.ok(currentUser);
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<User>> getAllUsers() {
        return ResponseEntity.ok(userService.getAllUsers());
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<User> getUserById(@PathVariable UUID id) {
        return ResponseEntity.ok(userService.getUserById(id));
    }

    @PatchMapping("/{id}/roles")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<User> updateRoles(
            @PathVariable UUID id,
            @RequestBody Set<String> roles) {
        return ResponseEntity.ok(userService.updateUserRoles(id, roles));
    }

    @PatchMapping("/{id}/toggle-status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<User> toggleStatus(@PathVariable UUID id) {
        return ResponseEntity.ok(userService.toggleUserStatus(id));
    }

    @PatchMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> updateUserByAdmin(
            @PathVariable UUID id,
            @RequestBody AdminUpdateUserRequest req) {
        try {
            return ResponseEntity.ok(userService.updateUserByAdmin(
                    id,
                    req.getName(),
                    req.getEmail(),
                    req.getPassword()
            ));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of("message", e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteUserByAdmin(@PathVariable UUID id) {
        userService.deleteUserByAdmin(id);
        return ResponseEntity.ok(Map.of("message", "User deleted"));
    }
}

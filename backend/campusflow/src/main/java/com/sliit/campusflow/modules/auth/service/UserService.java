package com.sliit.campusflow.modules.auth.service;

import com.sliit.campusflow.modules.auth.model.User;
import com.sliit.campusflow.modules.auth.repository.UserRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.*;

@Service
@Slf4j
public class UserService {

    @Autowired private UserRepository userRepository;

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    public User getUserById(UUID id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("User not found"));
    }

    public User updateUserRoles(UUID id, Set<String> roles) {
        User user = getUserById(id);
        if (roles == null || roles.isEmpty()) {
            user.setRoles("USER");
        } else {
            user.setRoles(String.join(",", roles));
        }
        return userRepository.save(user);
    }

    public User toggleUserStatus(UUID id) {
        User user = getUserById(id);
        user.setActive(!user.isActive());
        return userRepository.save(user);
    }
}

package com.sliit.campusflow.modules.auth.repository;

import com.sliit.campusflow.modules.auth.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserRepository extends JpaRepository<User, UUID> {
    Optional<User> findByEmail(String email);
    Optional<User> findByGoogleId(String googleId);
    boolean existsByEmail(String email);
    
    // Note: roles is a transient field, not a DB column, so this will be done in service
    // @Query("SELECT DISTINCT u FROM User u WHERE u.roles LIKE '%ADMIN%'")
    // List<User> findAllAdmins();
}

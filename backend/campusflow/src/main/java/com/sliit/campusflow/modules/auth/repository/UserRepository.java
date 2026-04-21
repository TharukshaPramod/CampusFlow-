package com.sliit.campusflow.modules.auth.repository;

import com.sliit.campusflow.modules.auth.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserRepository extends JpaRepository<User, UUID> {
    Optional<User> findByEmail(String email);
    Optional<User> findByGoogleId(String googleId);
    boolean existsByEmail(String email);

    @Query("SELECT DISTINCT u FROM User u JOIN u.roles r WHERE r.name = 'ROLE_ADMIN' OR r.name = 'ADMIN'")
    List<User> findAllAdmins();

    @Query("SELECT DISTINCT u FROM User u JOIN u.roles r WHERE r.name IN ('ROLE_TECHNICIAN', 'ROLE_ADMIN', 'TECHNICIAN', 'ADMIN')")
    List<User> findAssignableTechnicians();
}

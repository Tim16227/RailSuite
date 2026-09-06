/*
 * Copyright (c) 2026 Your RailSuite. All rights reserved.
 *
 * File:        UserRepository.java
 * Description: Data access repository responsible for handling CRUD operations
 *              and database queries for User entities.
 */
package de.railsuite.core.user;

import jakarta.transaction.Transactional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {

    @Modifying
    @Transactional
    @Query(value = """
            INSERT INTO users (keycloak_id, name, email)
            VALUES (:keycloakId, :name, :email)
            ON CONFLICT (keycloak_id)
            DO UPDATE SET
                name = EXCLUDED.name,
                email = EXCLUDED.email
            """, nativeQuery = true)
    void upsertUser(
            @Param("keycloakId") String keycloakId,
            @Param("name") String name,
            @Param("email") String email
    );

    Optional<User> findByKeycloakId(String keycloakId);
}
/*
 * Copyright (c) 2026 Your RailSuite. All rights reserved.
 *
 * File:        UserService.java
 * Description: Service component containing business logic for aggregating,
 *              calculating, and retrieving user basic information.
 */
package de.railsuite.core.user;

import de.railsuite.core.user.dto.ViewCustomerDTO;
import de.railsuite.core.user.mapper.UserDTOMapper;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class UserService {

    private final UserRepository repository;

    // Constructors
    public UserService(UserRepository repository) {
        this.repository = repository;
    }

    public User createUser(User user) {
        return repository.save(user);
    }

    public void upsertFromKeycloak(String keycloakId, String name, String email) {

        repository.upsertUser(keycloakId, name, email);
    }

    public List<User> getAllUsers() {
        return repository.findAll();
    }

    public User getByKeycloakId(String keycloakId) {

        return repository.findByKeycloakId(keycloakId)
                .orElseThrow(() ->
                        new IllegalStateException(
                                "User nicht gefunden."
                        )
                );
    }
}
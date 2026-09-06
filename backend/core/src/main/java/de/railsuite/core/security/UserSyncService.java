/*
 * Copyright (c) 2026 RailSuite. All rights reserved.
 *
 * File:        UserSyncService.java
 * Description: Service component containing the core business logic to synchronize,
 *              create, or update user profiles based on external Identity Provider data.
 */
package de.railsuite.core.security;

import de.railsuite.core.user.User;
import de.railsuite.core.user.UserRepository;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Service;

@Service
public class UserSyncService {

    private final UserRepository userRepository;

    // Constructors
    public UserSyncService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public User syncUser(Jwt jwt) {
        String keycloakId = jwt.getSubject();
        String email = jwt.getClaim("email");
        String username = jwt.getClaim("preferred_username");
        String firstName = jwt.getClaimAsString("given_name");
        String lastName = jwt.getClaimAsString("family_name");

        return userRepository.findByKeycloakId(keycloakId)
                .orElseGet(() -> {
                    User user = new User();
                    user.setKeycloakId(keycloakId);
                    user.setEmail(email);
                    user.setUsername(username);
                    user.setFirstName(firstName);
                    user.setLastName(lastName);
                    return userRepository.save(user);
                });
    }
}

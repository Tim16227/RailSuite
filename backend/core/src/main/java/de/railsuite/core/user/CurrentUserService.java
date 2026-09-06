/*
 * Copyright (c) 2026 Your RailSuite. All rights reserved.
 *
 * File:        CurrentUserService.java
 * Description: Service component containing business logic for aggregating,
 *              calculating, and retrieving basic information of the current user.
 */
package de.railsuite.core.user;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

@Service
public class CurrentUserService {

    private final UserRepository userRepository;

    // Constructors
    public CurrentUserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    // Getters / Setters
    public String getCurrentKeycloakId() {
        Authentication authentication =
                SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null || !(authentication.getPrincipal() instanceof Jwt jwt)) {
            throw new IllegalStateException("No authenticated user found");
        }

        return jwt.getSubject();
    }

    public User getCurrentUser() {
        Authentication authentication =
                SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null || !(authentication.getPrincipal() instanceof Jwt jwt)) {
            throw new IllegalStateException("No authenticated user found");
        }

        String keycloakId = jwt.getSubject();

        return userRepository.findByKeycloakId(keycloakId)
                .orElseThrow(() -> new IllegalStateException(
                        "User not found for keycloakId: " + keycloakId
                ));
    }

    public String getCurrentRole() {
        Jwt jwt = (Jwt) SecurityContextHolder
                .getContext()
                .getAuthentication()
                .getPrincipal();

        Map<String, Object> realmAccess =
                jwt.getClaim("realm_access");

        List<String> roles =
                (List<String>) realmAccess.get("roles");

        return roles.stream()
                .filter(role ->
                        role.equals("ADMIN")
                                || role.equals("EMPLOYEE")
                                || role.equals("CUSTOMER")
                )
                .findFirst()
                .orElseThrow(() ->
                        new RuntimeException("No valid role found")
                );
    }
}

/*
 * Copyright (c) 2026 Your RailSuite. All rights reserved.
 *
 * File:        UserLoginController.java
 * Description: REST controller providing API endpoints to retrieve
 *              basic information of the logged in user.
 */
package de.railsuite.core.user;

import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
public class UserLoginController {

    public final UserRepository userRepository;

    // Constructors
    public UserLoginController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @GetMapping("/api/me")
    public Map<String, Object> me(
            Authentication authentication
    ) {

        JwtAuthenticationToken jwtAuthentication =
                (JwtAuthenticationToken) authentication;

        var jwt =
                jwtAuthentication.getToken();

        String keycloakId = jwt.getSubject();

        return Map.of(
                "keycloakId",
                jwt.getSubject(),

                "username",
                jwt.getClaimAsString(
                        "preferred_username"
                ),

                "firstName",
                jwt.getClaimAsString(
                        "given_name"
                ),

                "lastName",
                jwt.getClaimAsString(
                        "family_name"
                ),

                "email",
                jwt.getClaimAsString(
                        "email"
                )
        );
    }
}
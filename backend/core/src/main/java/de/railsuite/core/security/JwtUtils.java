/*
 * Copyright (c) 2026 RailSuite. All rights reserved.
 *
 * File:        JwtUtils.java
 * Description: Utility component responsible for generating, parsing,
 *              and validating JSON Web Tokens (JWT) used in the authentication process.
 */
package de.railsuite.core.security;

import org.springframework.security.oauth2.jwt.Jwt;

public class JwtUtils {

    // Getters / Setters
    public static String getKeycloakId(Jwt jwt) {
        return jwt.getSubject();
    }

    public static String getEmail(Jwt jwt) {
        return jwt.getClaim("email");
    }

    public static String getUsername(Jwt jwt) {
        return jwt.getClaim("preferred_username");
    }
}

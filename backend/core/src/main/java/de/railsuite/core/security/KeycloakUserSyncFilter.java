/*
 * Copyright (c) 2026 RailSuite. All rights reserved.
 *
 * File:        KeycloakUserSyncFilter.java
 * Description: HTTP servlet filter responsible for intercepting requests to extract
 *              Keycloak authentication tokens and synchronizing user profiles with the local database.
 */
package de.railsuite.core.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
public class KeycloakUserSyncFilter extends OncePerRequestFilter {

    private final UserSyncService userSyncService;

    // Constructors
    public KeycloakUserSyncFilter(UserSyncService userSyncService) {
        this.userSyncService = userSyncService;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain)
            throws ServletException, IOException {

        Authentication auth = SecurityContextHolder.getContext().getAuthentication();

        if (auth instanceof JwtAuthenticationToken jwtAuth) {

            Jwt jwt = jwtAuth.getToken();

            userSyncService.syncUser(jwt);
        }

        filterChain.doFilter(request, response);
    }
}
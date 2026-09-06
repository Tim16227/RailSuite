/*
 * Copyright (c) 2026 Your RailSuite. All rights reserved.
 *
 * File:        SecurityConfig.java
 * Description: Core security configuration component defining authentication,
 *               authorization, and cryptographic policies for the application.
 */
package de.railsuite.core.config;

import de.railsuite.core.security.KeycloakUserSyncFilter;
import jakarta.annotation.PostConstruct;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Profile;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.oauth2.server.resource.web.authentication.BearerTokenAuthenticationFilter;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@EnableWebSecurity
@Profile("prod")
public class SecurityConfig {

    @PostConstruct
    public void init() {
        System.out.println("CUSTOM SECURITY CONFIG ACTIVE");
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http,
                                                   KeycloakUserSyncFilter syncFilter) throws Exception {

        return http
                .csrf(csrf -> csrf.disable())

                .cors(cors -> {})

                .sessionManagement(session ->
                        session.sessionCreationPolicy(SessionCreationPolicy.STATELESS)
                )

                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/api/**").permitAll()
                        .anyRequest().permitAll()
                )
                .addFilterAfter(syncFilter, BearerTokenAuthenticationFilter.class)
                .build();
    }
}
/*
 * Copyright (c) 2026 Your RailSuite. All rights reserved.
 *
 * File:        UserController.java
 * Description: REST controller providing API endpoints to retrieve
 *              basic information of the users.
 */
package de.railsuite.core.user;

import de.railsuite.core.user.dto.ViewCustomerDTO;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;

    // Constructors
    public UserController(UserService userService) {
        this.userService = userService;
    }

    @PostMapping
    public User create(@RequestBody User user) {
        return userService.createUser(user);
    }

    // Getters / Setters
    @GetMapping
    public List<User> getAll() {
        return userService.getAllUsers();
    }
}
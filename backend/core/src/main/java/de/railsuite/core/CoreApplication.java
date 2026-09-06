/*
 * Copyright (c) 2026 Your RailSuite. All rights reserved.
 *
 * File:        CoreApplication.java
 * Description: Main entry point of the Spring Boot application,
 *              responsible for bootstrapping and initializing the core ecosystem.
 */
package de.railsuite.core;

import jakarta.annotation.PostConstruct;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class CoreApplication {

	public static void main(String[] args) {
		SpringApplication.run(CoreApplication.class, args);
	}


	@PostConstruct
	public void debug() {
		System.out.println("CORE APP STARTED");
	}

}

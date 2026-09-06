package de.railsuite.core.digital.repository;

import de.railsuite.core.digital.entity.DigitalSystem;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface DigitalSystemRepository extends JpaRepository<DigitalSystem, UUID> {
}
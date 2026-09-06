package de.railsuite.core.layout.repository;

import de.railsuite.core.layout.entity.Layout;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface LayoutRepository
        extends JpaRepository<Layout, UUID> {
}
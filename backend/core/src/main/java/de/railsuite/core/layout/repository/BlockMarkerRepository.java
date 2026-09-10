package de.railsuite.core.layout.repository;

import de.railsuite.core.layout.entity.BlockMarker;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface BlockMarkerRepository
        extends JpaRepository<BlockMarker, UUID> {
}
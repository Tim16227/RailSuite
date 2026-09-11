package de.railsuite.core.layout.repository;

import de.railsuite.core.layout.entity.BlockSignal;
import de.railsuite.core.layout.entity.BlockSignalSide;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface BlockSignalRepository
        extends JpaRepository<BlockSignal, UUID> {

    List<BlockSignal> findByBlockId(
            UUID blockId
    );

    Optional<BlockSignal> findByBlockIdAndSide(
            UUID blockId,
            BlockSignalSide side
    );
}
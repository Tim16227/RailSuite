package de.railsuite.core.layout.repository;

import de.railsuite.core.layout.entity.BlockContactAssignment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface BlockContactAssignmentRepository
        extends JpaRepository<
        BlockContactAssignment,
        UUID
        > {

    void deleteByBlockId(
            UUID blockId
    );

    void deleteByContactDetectorId(
            UUID contactDetectorId
    );
}
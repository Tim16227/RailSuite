package de.railsuite.core.layout.dto;

import de.railsuite.core.layout.entity.BlockContactRole;

import java.util.UUID;

public record BlockContactAssignmentResponse(
        UUID id,
        UUID contactDetectorId,
        String contactDetectorName,
        String contactDetectorType,
        BlockContactRole role,
        Integer positionMm
) {
}
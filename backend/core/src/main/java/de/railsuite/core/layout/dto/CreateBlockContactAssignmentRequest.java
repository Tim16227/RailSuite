package de.railsuite.core.layout.dto;

import de.railsuite.core.layout.entity.BlockContactRole;
import jakarta.validation.constraints.NotNull;

import java.util.UUID;

public record CreateBlockContactAssignmentRequest(

        @NotNull
        UUID contactDetectorId,

        @NotNull
        BlockContactRole role,

        Integer positionMm
) {
}
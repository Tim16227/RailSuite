package de.railsuite.core.layout.dto;

import de.railsuite.core.layout.entity.BlockDirection;
import de.railsuite.core.layout.entity.BlockMarkerType;

import java.util.UUID;

public record BlockMarkerResponse(
        UUID id,
        BlockMarkerType type,
        int positionMm,
        int lengthMm,
        BlockDirection direction
) {
}
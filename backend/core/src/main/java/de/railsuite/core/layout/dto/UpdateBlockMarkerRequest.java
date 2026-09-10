package de.railsuite.core.layout.dto;

import de.railsuite.core.layout.entity.BlockDirection;
import de.railsuite.core.layout.entity.BlockMarkerType;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public record UpdateBlockMarkerRequest(

        @NotNull
        BlockMarkerType type,

        @Min(0)
        int positionMm,

        @Min(1)
        int lengthMm,

        @NotNull
        BlockDirection direction
) {
}
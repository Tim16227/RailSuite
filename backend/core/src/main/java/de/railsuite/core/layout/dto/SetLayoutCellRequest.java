package de.railsuite.core.layout.dto;

import de.railsuite.core.layout.entity.LayoutElementType;
import de.railsuite.core.layout.entity.LayoutOrientation;
import de.railsuite.core.layout.entity.LayoutTurnoutHand;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

import java.util.UUID;

public record SetLayoutCellRequest(
        @NotNull LayoutElementType elementType,
        @NotNull LayoutOrientation orientation,
        LayoutTurnoutHand turnoutHand,
        UUID digitalSystemId,
        @Min(1) Integer digitalAddress,
        @Min(1) @Max(4) Integer digitalPort
) {
}
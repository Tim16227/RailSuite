package de.railsuite.core.layout.dto;

import de.railsuite.core.digital.dto.DigitalSystemResponse;
import de.railsuite.core.layout.entity.LayoutElementType;
import de.railsuite.core.layout.entity.LayoutOrientation;
import de.railsuite.core.layout.entity.LayoutTurnoutHand;
import de.railsuite.core.layout.geometry.LayoutPort;

import java.util.List;
import java.util.UUID;

public record LayoutCellResponse(
        UUID id,
        int x,
        int y,
        LayoutElementType elementType,
        LayoutOrientation orientation,
        LayoutTurnoutHand turnoutHand,
        DigitalSystemResponse digitalSystem,
        Integer digitalAddress,
        Integer digitalPort,
        List<LayoutPort> ports,
        List<LayoutConnectionResponse> connections
) {
}
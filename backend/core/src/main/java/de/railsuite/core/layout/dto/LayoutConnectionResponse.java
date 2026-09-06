package de.railsuite.core.layout.dto;

import de.railsuite.core.layout.geometry.LayoutPort;

public record LayoutConnectionResponse(
        LayoutPort first,
        LayoutPort second
) {}

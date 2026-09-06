package de.railsuite.core.layout.geometry;

import de.railsuite.core.layout.entity.LayoutElementType;
import de.railsuite.core.layout.entity.LayoutOrientation;

import java.util.Set;

public record LayoutElementGeometry(
        LayoutElementType type,
        LayoutOrientation orientation,
        Set<LayoutPort> ports,
        Set<LayoutConnection> connections
) {}
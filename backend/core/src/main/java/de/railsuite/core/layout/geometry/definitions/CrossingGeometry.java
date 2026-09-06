package de.railsuite.core.layout.geometry.definitions;

import de.railsuite.core.layout.entity.LayoutElementType;
import de.railsuite.core.layout.entity.LayoutOrientation;
import de.railsuite.core.layout.geometry.LayoutConnection;
import de.railsuite.core.layout.geometry.LayoutElementDefinition;
import de.railsuite.core.layout.geometry.LayoutElementGeometry;
import de.railsuite.core.layout.geometry.LayoutPort;

import java.util.EnumSet;
import java.util.Set;

public class CrossingGeometry
        implements LayoutElementDefinition {

    private static final Set<LayoutPort> BASE_PORTS =
            EnumSet.of(
                    LayoutPort.NORTH,
                    LayoutPort.EAST,
                    LayoutPort.SOUTH,
                    LayoutPort.WEST
            );

    private static final Set<LayoutConnection> BASE_CONNECTIONS =
            Set.of(
                    new LayoutConnection(
                            LayoutPort.NORTH,
                            LayoutPort.SOUTH
                    ),
                    new LayoutConnection(
                            LayoutPort.WEST,
                            LayoutPort.EAST
                    )
            );

    @Override
    public LayoutElementType getType() {
        return LayoutElementType.CROSSING;
    }

    @Override
    public LayoutElementGeometry createGeometry(
            LayoutOrientation orientation
    ) {
        return new LayoutElementGeometry(
                getType(),
                orientation,
                BASE_PORTS,
                BASE_CONNECTIONS
        );
    }
}
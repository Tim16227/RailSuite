package de.railsuite.core.layout.geometry.definitions;

import de.railsuite.core.layout.entity.LayoutElementType;
import de.railsuite.core.layout.entity.LayoutOrientation;
import de.railsuite.core.layout.geometry.*;

import java.util.EnumSet;
import java.util.Set;

public class StraightGeometry
        implements LayoutElementDefinition {

    private static final Set<LayoutPort> BASE_PORTS =
            EnumSet.of(
                    LayoutPort.NORTH,
                    LayoutPort.SOUTH
            );

    @Override
    public LayoutElementType getType() {
        return LayoutElementType.STRAIGHT;
    }

    @Override
    public LayoutElementGeometry createGeometry(
            LayoutOrientation orientation
    ) {
        Set<LayoutPort> ports =
                LayoutGeometryService.rotatePorts(
                        BASE_PORTS,
                        orientation
                );

        Set<LayoutConnection> connections =
                LayoutGeometryService.rotateConnections(
                        Set.of(
                                new LayoutConnection(
                                        LayoutPort.NORTH,
                                        LayoutPort.SOUTH
                                )
                        ),
                        orientation
                );

        return new LayoutElementGeometry(
                getType(),
                orientation,
                ports,
                connections
        );
    }
}

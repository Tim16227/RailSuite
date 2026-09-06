package de.railsuite.core.layout.geometry.definitions;

import de.railsuite.core.layout.entity.LayoutElementType;
import de.railsuite.core.layout.entity.LayoutOrientation;
import de.railsuite.core.layout.entity.LayoutTurnoutHand;
import de.railsuite.core.layout.geometry.LayoutConnection;
import de.railsuite.core.layout.geometry.LayoutElementDefinition;
import de.railsuite.core.layout.geometry.LayoutElementGeometry;
import de.railsuite.core.layout.geometry.LayoutPort;
import org.springframework.stereotype.Component;

import java.util.Set;

@Component
public class TurnoutGeometry implements LayoutElementDefinition {

    @Override
    public LayoutElementType getType() {
        return LayoutElementType.TURNOUT;
    }

    @Override
    public LayoutElementGeometry createGeometry(
            LayoutOrientation orientation
    ) {
        return createGeometry(
                orientation,
                LayoutTurnoutHand.LEFT
        );
    }

    @Override
    public LayoutElementGeometry createGeometry(
            LayoutOrientation orientation,
            LayoutTurnoutHand turnoutHand
    ) {
        LayoutTurnoutHand effectiveHand =
                turnoutHand == null
                        ? LayoutTurnoutHand.LEFT
                        : turnoutHand;

        LayoutPort branchPort =
                effectiveHand == LayoutTurnoutHand.LEFT
                        ? LayoutPort.NORTH_EAST
                        : LayoutPort.SOUTH_EAST;

        Set<LayoutPort> ports = Set.of(
                LayoutPort.WEST,
                LayoutPort.EAST,
                branchPort
        );

        Set<LayoutConnection> connections = Set.of(
                new LayoutConnection(
                        LayoutPort.WEST,
                        LayoutPort.EAST
                ),
                new LayoutConnection(
                        LayoutPort.WEST,
                        branchPort
                )
        );

        return new LayoutElementGeometry(
                LayoutElementType.TURNOUT,
                orientation,
                ports,
                connections
        );
    }
}
package de.railsuite.core.layout.geometry;

import de.railsuite.core.layout.entity.LayoutElementType;
import de.railsuite.core.layout.entity.LayoutOrientation;
import de.railsuite.core.layout.entity.LayoutTurnoutHand;
import org.springframework.stereotype.Service;

import java.util.LinkedHashSet;
import java.util.Set;

@Service
public class LayoutGeometryService {

    private final LayoutElementRegistry registry;

    public LayoutGeometryService(
            LayoutElementRegistry registry
    ) {
        this.registry = registry;
    }

    public LayoutElementGeometry getGeometry(
            LayoutElementType type,
            LayoutOrientation orientation
    ) {
        return getGeometry(
                type,
                orientation,
                null
        );
    }

    public LayoutElementGeometry getGeometry(
            LayoutElementType type,
            LayoutOrientation orientation,
            LayoutTurnoutHand turnoutHand
    ) {
        LayoutElementGeometry baseGeometry;

        if (type == LayoutElementType.TURNOUT) {
            LayoutTurnoutHand effectiveHand =
                    turnoutHand == null
                            ? LayoutTurnoutHand.LEFT
                            : turnoutHand;

            baseGeometry =
                    registry
                            .get(type)
                            .createGeometry(
                                    LayoutOrientation.NORTH,
                                    effectiveHand
                            );
        } else {
            baseGeometry =
                    registry
                            .get(type)
                            .createGeometry(
                                    LayoutOrientation.NORTH
                            );
        }

        return new LayoutElementGeometry(
                type,
                orientation,
                rotatePorts(
                        baseGeometry.ports(),
                        orientation
                ),
                rotateConnections(
                        baseGeometry.connections(),
                        orientation
                )
        );
    }

    public static Set<LayoutPort> rotatePorts(
            Set<LayoutPort> ports,
            LayoutOrientation orientation
    ) {
        Set<LayoutPort> result =
                new LinkedHashSet<>();

        int steps =
                orientationToSteps(orientation);

        for (LayoutPort port : ports) {
            result.add(
                    port.rotate45(steps)
            );
        }

        return result;
    }

    public static Set<LayoutConnection> rotateConnections(
            Set<LayoutConnection> connections,
            LayoutOrientation orientation
    ) {
        Set<LayoutConnection> result =
                new LinkedHashSet<>();

        int steps =
                orientationToSteps(orientation);

        for (LayoutConnection connection : connections) {
            result.add(
                    new LayoutConnection(
                            connection.first().rotate45(steps),
                            connection.second().rotate45(steps)
                    )
            );
        }

        return result;
    }

    private static int orientationToSteps(
            LayoutOrientation orientation
    ) {
        return switch (orientation) {
            case NORTH -> 0;
            case NORTH_EAST -> 1;
            case EAST -> 2;
            case SOUTH_EAST -> 3;
            case SOUTH -> 4;
            case SOUTH_WEST -> 5;
            case WEST -> 6;
            case NORTH_WEST -> 7;
        };
    }
}
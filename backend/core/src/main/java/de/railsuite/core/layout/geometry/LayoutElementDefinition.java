package de.railsuite.core.layout.geometry;

import de.railsuite.core.layout.entity.LayoutElementType;
import de.railsuite.core.layout.entity.LayoutOrientation;
import de.railsuite.core.layout.entity.LayoutTurnoutHand;

public interface LayoutElementDefinition {

    LayoutElementType getType();

    LayoutElementGeometry createGeometry(
            LayoutOrientation orientation
    );

    default LayoutElementGeometry createGeometry(
            LayoutOrientation orientation,
            LayoutTurnoutHand turnoutHand
    ) {
        return createGeometry(orientation);
    }
}
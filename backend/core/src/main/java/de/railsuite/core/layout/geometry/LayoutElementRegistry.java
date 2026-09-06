package de.railsuite.core.layout.geometry;

import de.railsuite.core.layout.entity.LayoutElementType;
import de.railsuite.core.layout.geometry.definitions.*;
import org.springframework.stereotype.Component;

import java.util.EnumMap;
import java.util.Map;

@Component
public class LayoutElementRegistry {

    private final Map<LayoutElementType, LayoutElementDefinition>
            definitions = new EnumMap<>(LayoutElementType.class);

    public LayoutElementRegistry() {
        register(new StraightGeometry());
        register(new Curve45Geometry());
        register(new Curve90Geometry());
        register(new TurnoutGeometry());
        register(new CrossingGeometry());
    }

    private void register(LayoutElementDefinition definition) {
        definitions.put(
                definition.getType(),
                definition
        );
    }

    public LayoutElementDefinition get(
            LayoutElementType type
    ) {
        LayoutElementDefinition definition =
                definitions.get(type);

        if (definition == null) {
            throw new IllegalArgumentException(
                    "No geometry definition for: " + type
            );
        }

        return definition;
    }
}

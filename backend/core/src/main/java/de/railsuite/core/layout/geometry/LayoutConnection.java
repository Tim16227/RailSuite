package de.railsuite.core.layout.geometry;

public record LayoutConnection(
        LayoutPort first,
        LayoutPort second
) {

    public LayoutConnection {
        if (first == null || second == null) {
            throw new IllegalArgumentException(
                    "Connection ports must not be null"
            );
        }

        if (first == second) {
            throw new IllegalArgumentException(
                    "A connection cannot connect a port to itself"
            );
        }
    }
}

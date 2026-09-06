package de.railsuite.core.layout.geometry;

public enum LayoutPort {

    NORTH(0, -1, 270),
    NORTH_EAST(1, -1, 315),
    EAST(1, 0, 0),
    SOUTH_EAST(1, 1, 45),
    SOUTH(0, 1, 90),
    SOUTH_WEST(-1, 1, 135),
    WEST(-1, 0, 180),
    NORTH_WEST(-1, -1, 225);

    private final int dx;
    private final int dy;
    private final int angle;

    LayoutPort(
            int dx,
            int dy,
            int angle
    ) {
        this.dx = dx;
        this.dy = dy;
        this.angle = angle;
    }

    public int dx() {
        return dx;
    }

    public int dy() {
        return dy;
    }

    public int angle() {
        return angle;
    }

    public LayoutPort opposite() {
        return switch (this) {
            case NORTH -> SOUTH;
            case NORTH_EAST -> SOUTH_WEST;
            case EAST -> WEST;
            case SOUTH_EAST -> NORTH_WEST;
            case SOUTH -> NORTH;
            case SOUTH_WEST -> NORTH_EAST;
            case WEST -> EAST;
            case NORTH_WEST -> SOUTH_EAST;
        };
    }

    public LayoutPort rotate45(
            int steps
    ) {
        LayoutPort[] values = values();

        int index = Math.floorMod(
                ordinal() + steps,
                values.length
        );

        return values[index];
    }
}

package de.railsuite.core.layout.exception;

import java.util.UUID;

public class LayoutNotFoundException
        extends RuntimeException {

    public LayoutNotFoundException(UUID id) {
        super("Layout not found: " + id);
    }
}

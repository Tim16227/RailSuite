package de.railsuite.core.digital.exception;

import java.util.UUID;

public class DigitalSystemNotFoundException extends RuntimeException {

    public DigitalSystemNotFoundException(UUID id) {
        super("Digital system not found: " + id);
    }
}
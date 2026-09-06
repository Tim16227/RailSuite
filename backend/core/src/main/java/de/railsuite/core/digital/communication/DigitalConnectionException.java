package de.railsuite.core.digital.communication;

public class DigitalConnectionException
        extends RuntimeException {

    public DigitalConnectionException(
            String message
    ) {
        super(message);
    }

    public DigitalConnectionException(
            String message,
            Throwable cause
    ) {
        super(message, cause);
    }
}
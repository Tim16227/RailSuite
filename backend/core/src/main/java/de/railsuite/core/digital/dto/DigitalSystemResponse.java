package de.railsuite.core.digital.dto;

import de.railsuite.core.digital.entity.DigitalInterfaceType;

import java.util.UUID;

public record DigitalSystemResponse(
        UUID id,
        String name,
        String manufacturer,
        String model,
        DigitalInterfaceType interfaceType,
        int sendPause,
        int turnoutPause,
        String host,
        Integer port
) {
}
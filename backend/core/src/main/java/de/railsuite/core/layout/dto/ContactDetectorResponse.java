package de.railsuite.core.layout.dto;

import de.railsuite.core.layout.entity.ContactDetectorType;

import java.util.UUID;

public record ContactDetectorResponse(
        UUID id,
        String name,
        ContactDetectorType type,
        UUID digitalSystemId,
        String digitalSystemName,
        Integer digitalAddress
) {
}
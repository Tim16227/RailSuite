package de.railsuite.core.layout.dto;

import de.railsuite.core.layout.entity.ContactDetectorType;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.util.UUID;

public record CreateContactDetectorRequest(

        @NotBlank
        String name,

        @NotNull
        ContactDetectorType type,

        UUID digitalSystemId,

        @Min(1)
        Integer digitalAddress
) {
}
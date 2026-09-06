package de.railsuite.core.digital.dto;

import de.railsuite.core.digital.entity.DigitalInterfaceType;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record CreateDigitalSystemRequest(

        @NotBlank
        String name,

        @NotBlank
        String manufacturer,

        @NotBlank
        String model,

        @NotNull
        DigitalInterfaceType interfaceType,

        @Min(0)
        int sendPause,

        @Min(0)
        int turnoutPause,

        String host,

        @Min(1)
        Integer port
) {
}
package de.railsuite.core.layout.dto;

import jakarta.validation.constraints.*;

public record UpdateLayoutRequest(

        @NotBlank
        @Size(max = 100)
        String name

) {
}
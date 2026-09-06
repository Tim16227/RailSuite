package de.railsuite.core.layout.dto;

import jakarta.validation.constraints.*;

public record CreateLayoutRequest(

        @NotBlank
        @Size(max = 100)
        String name,

        @Min(1)
        @Max(1000)
        int width,

        @Min(1)
        @Max(1000)
        int height

) {
}
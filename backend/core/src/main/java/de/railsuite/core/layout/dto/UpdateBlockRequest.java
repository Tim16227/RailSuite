package de.railsuite.core.layout.dto;

import de.railsuite.core.layout.entity.BlockDirection;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record UpdateBlockRequest(

        @NotBlank
        String name,

        @Min(1)
        int lengthMm,

        @NotNull
        BlockDirection direction
) {
}
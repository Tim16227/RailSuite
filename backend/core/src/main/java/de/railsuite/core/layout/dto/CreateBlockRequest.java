package de.railsuite.core.layout.dto;

import de.railsuite.core.layout.entity.BlockDirection;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

import java.util.List;

public record CreateBlockRequest(

        @NotBlank
        String name,

        @Min(1)
        int lengthMm,

        @NotNull
        BlockDirection direction,

        @NotEmpty
        List<@Valid BlockCellRequest> cells
) {
}
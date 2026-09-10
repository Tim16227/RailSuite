package de.railsuite.core.layout.dto;

import jakarta.validation.constraints.Min;

public record BlockCellRequest(
        @Min(0)
        int x,

        @Min(0)
        int y
) {
}
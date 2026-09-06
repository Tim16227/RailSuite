package de.railsuite.core.layout.dto;

import java.util.List;
import java.util.UUID;

public record LayoutResponse(

        UUID id,

        String name,

        int width,

        int height,

        long version,

        List<LayoutCellResponse> cells

) {
}

package de.railsuite.core.layout.dto;

import de.railsuite.core.layout.entity.BlockDirection;

import java.util.List;
import java.util.UUID;

public record BlockResponse(
        UUID id,
        UUID layoutId,
        String name,
        int lengthMm,
        BlockDirection direction,
        List<BlockCellRequest> cells,
        List<BlockMarkerResponse> markers,
        List<BlockContactAssignmentResponse> contacts
) {
}
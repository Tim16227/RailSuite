package de.railsuite.core.layout.dto;

import de.railsuite.core.layout.entity.*;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.util.List;
import java.util.UUID;

public final class BlockEditorDto {

    private BlockEditorDto() {
    }

    public record Response(
            UUID id,
            UUID layoutId,
            String name,
            int lengthMm,
            BlockDirection direction,
            boolean showSignals,
            boolean visibleOnlyInEditMode,
            boolean requestYellow,
            Integer maximumSpeedKmh,
            Integer slowSpeedKmh,
            boolean includeInTrainTracking,
            Integer maximumTrainLengthMm,
            BlockGridOrientation gridOrientation,
            List<BlockCellRequest> cells,
            List<Marker> markers,
            List<Contact> contacts,
            List<Signal> signals
    ) {
    }

    public record Marker(
            UUID id,
            UUID contactAssignmentId,
            BlockMarkerType type,
            int positionMm,
            int lengthMm,
            BlockDirection direction,
            BlockMarkerTrainPosition trainPosition,
            boolean scheduledStop
    ) {
    }

    public record Contact(
            UUID id,
            UUID contactDetectorId,
            String contactDetectorName,
            String contactDetectorType,
            BlockContactRole role,
            Integer positionMm,
            int lengthMm
    ) {
    }

    public record Signal(
            UUID id,
            BlockSignalSide side,
            BlockSignalType signalType
    ) {
    }

    public record UpdateBlock(
            @NotBlank
            String name,

            @Min(1)
            int lengthMm,

            @NotNull
            BlockDirection direction,

            boolean showSignals,
            boolean visibleOnlyInEditMode,
            boolean requestYellow,

            Integer maximumSpeedKmh,

            Integer slowSpeedKmh,

            boolean includeInTrainTracking,

            Integer maximumTrainLengthMm,

            @NotNull
            BlockGridOrientation gridOrientation
    ) {
    }

    public record MarkerRequest(
            @NotNull
            BlockMarkerType type,

            @Min(0)
            int positionMm,

            @Min(0)
            int lengthMm,

            @NotNull
            BlockDirection direction,

            @NotNull
            BlockMarkerTrainPosition trainPosition,

            boolean scheduledStop,

            UUID contactAssignmentId
    ) {
    }

    public record ContactRequest(
            Integer positionMm,

            @Min(1)
            int lengthMm
    ) {
    }

    public record SignalRequest(
            @NotNull
            BlockSignalType signalType
    ) {
    }
}
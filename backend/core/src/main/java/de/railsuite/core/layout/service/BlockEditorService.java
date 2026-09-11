package de.railsuite.core.layout.service;

import de.railsuite.core.layout.dto.BlockCellRequest;
import de.railsuite.core.layout.dto.BlockEditorDto;
import de.railsuite.core.layout.entity.*;
import de.railsuite.core.layout.exception.LayoutNotFoundException;
import de.railsuite.core.layout.repository.*;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
@Transactional
public class BlockEditorService {

    private final LayoutRepository layoutRepository;
    private final BlockRepository blockRepository;
    private final BlockMarkerRepository markerRepository;
    private final BlockContactAssignmentRepository assignmentRepository;
    private final BlockSignalRepository signalRepository;

    public BlockEditorService(
            LayoutRepository layoutRepository,
            BlockRepository blockRepository,
            BlockMarkerRepository markerRepository,
            BlockContactAssignmentRepository assignmentRepository,
            BlockSignalRepository signalRepository
    ) {
        this.layoutRepository =
                layoutRepository;
        this.blockRepository =
                blockRepository;
        this.markerRepository =
                markerRepository;
        this.assignmentRepository =
                assignmentRepository;
        this.signalRepository =
                signalRepository;
    }

    public BlockEditorDto.Response getBlock(
            UUID layoutId,
            UUID blockId
    ) {
        Block block =
                findBlock(
                        layoutId,
                        blockId
                );

        return toResponse(block);
    }

    public BlockEditorDto.Response updateBlock(
            UUID layoutId,
            UUID blockId,
            BlockEditorDto.UpdateBlock request
    ) {
        Block block =
                findBlock(
                        layoutId,
                        blockId
                );

        validateSpeed(
                request.maximumSpeedKmh(),
                "Maximumgeschwindigkeit"
        );

        validateSpeed(
                request.slowSpeedKmh(),
                "Langsamgeschwindigkeit"
        );

        validateTrainLength(
                request.maximumTrainLengthMm()
        );

        block.updateEditorProperties(
                request.name().trim(),
                request.lengthMm(),
                request.direction(),
                request.showSignals(),
                request.visibleOnlyInEditMode(),
                request.requestYellow(),
                request.maximumSpeedKmh(),
                request.slowSpeedKmh(),
                request.includeInTrainTracking(),
                request.maximumTrainLengthMm(),
                request.gridOrientation()
        );

        return toResponse(block);
    }

    public BlockEditorDto.Marker createMarker(
            UUID layoutId,
            UUID blockId,
            BlockEditorDto.MarkerRequest request
    ) {
        Block block =
                findBlock(
                        layoutId,
                        blockId
                );

        validateMarker(
                block,
                request.positionMm(),
                request.lengthMm()
        );

        BlockMarker marker =
                new BlockMarker(
                        block,
                        request.type(),
                        request.positionMm(),
                        request.lengthMm(),
                        request.direction(),
                        request.trainPosition(),
                        request.scheduledStop()
                );

        markerRepository.save(
                marker
        );

        return toMarkerResponse(
                marker
        );
    }

    public BlockEditorDto.Marker updateMarker(
            UUID layoutId,
            UUID markerId,
            BlockEditorDto.MarkerRequest request
    ) {
        BlockMarker marker =
                markerRepository
                        .findById(markerId)
                        .orElseThrow();

        Block block =
                marker.getBlock();

        if (
                !block.getLayout()
                        .getId()
                        .equals(layoutId)
        ) {
            throw new IllegalArgumentException(
                    "Marker belongs to another layout"
            );
        }

        validateMarker(
                block,
                request.positionMm(),
                request.lengthMm()
        );

        marker.update(
                request.type(),
                request.positionMm(),
                request.lengthMm(),
                request.direction(),
                request.trainPosition(),
                request.scheduledStop()
        );

        return toMarkerResponse(
                marker
        );
    }

    public void deleteMarker(
            UUID layoutId,
            UUID markerId
    ) {
        BlockMarker marker =
                markerRepository
                        .findById(markerId)
                        .orElseThrow();

        if (
                !marker.getBlock()
                        .getLayout()
                        .getId()
                        .equals(layoutId)
        ) {
            throw new IllegalArgumentException(
                    "Marker belongs to another layout"
            );
        }

        markerRepository.delete(
                marker
        );
    }

    public BlockEditorDto.Contact updateContact(
            UUID layoutId,
            UUID assignmentId,
            BlockEditorDto.ContactRequest request
    ) {
        BlockContactAssignment assignment =
                assignmentRepository
                        .findById(assignmentId)
                        .orElseThrow();

        Block block =
                assignment.getBlock();

        if (
                !block.getLayout()
                        .getId()
                        .equals(layoutId)
        ) {
            throw new IllegalArgumentException(
                    "Contact assignment belongs to another layout"
            );
        }

        int position =
                request.positionMm() == null
                        ? 0
                        : request.positionMm();

        if (
                position < 0 ||
                        position > block.getLengthMm()
        ) {
            throw new IllegalArgumentException(
                    "Contact position is outside the block"
            );
        }

        if (
                position +
                        request.lengthMm()
                        > block.getLengthMm()
        ) {
            throw new IllegalArgumentException(
                    "Contact section exceeds block length"
            );
        }

        assignment.updateEditorPosition(
                request.positionMm(),
                request.lengthMm()
        );

        return toContactResponse(
                assignment
        );
    }

    public BlockEditorDto.Signal updateSignal(
            UUID layoutId,
            UUID blockId,
            BlockSignalSide side,
            BlockEditorDto.SignalRequest request
    ) {
        Block block =
                findBlock(
                        layoutId,
                        blockId
                );

        BlockSignal signal =
                signalRepository
                        .findByBlockIdAndSide(
                                block.getId(),
                                side
                        )
                        .orElseGet(
                                () ->
                                        new BlockSignal(
                                                block,
                                                side,
                                                request.signalType()
                                        )
                        );

        signal.update(
                request.signalType()
        );

        signal =
                signalRepository.save(
                        signal
                );

        return toSignalResponse(
                signal
        );
    }

    private Block findBlock(
            UUID layoutId,
            UUID blockId
    ) {
        layoutRepository
                .findById(layoutId)
                .orElseThrow(() ->
                        new LayoutNotFoundException(
                                layoutId
                        )
                );

        Block block =
                blockRepository
                        .findById(blockId)
                        .orElseThrow();

        if (
                !block.getLayout()
                        .getId()
                        .equals(layoutId)
        ) {
            throw new IllegalArgumentException(
                    "Block belongs to another layout"
            );
        }

        return block;
    }

    private void validateMarker(
            Block block,
            int positionMm,
            int lengthMm
    ) {
        if (
                positionMm < 0 ||
                        positionMm > block.getLengthMm()
        ) {
            throw new IllegalArgumentException(
                    "Marker position is outside the block"
            );
        }

        if (
                lengthMm <= 0 ||
                        positionMm + lengthMm >
                                block.getLengthMm()
        ) {
            throw new IllegalArgumentException(
                    "Marker exceeds block length"
            );
        }
    }

    private void validateSpeed(
            Integer speed,
            String label
    ) {
        if (
                speed != null &&
                        speed < 0
        ) {
            throw new IllegalArgumentException(
                    label +
                            " darf nicht negativ sein."
            );
        }
    }

    private void validateTrainLength(
            Integer length
    ) {
        if (
                length != null &&
                        length < 0
        ) {
            throw new IllegalArgumentException(
                    "Maximale Zuglänge darf nicht negativ sein."
            );
        }
    }

    private BlockEditorDto.Response toResponse(
            Block block
    ) {
        List<BlockCellRequest> cells =
                block.getCells()
                        .stream()
                        .map(
                                cell ->
                                        new BlockCellRequest(
                                                cell.getX(),
                                                cell.getY()
                                        )
                        )
                        .toList();

        List<BlockEditorDto.Marker> markers =
                block.getMarkers()
                        .stream()
                        .map(
                                this::toMarkerResponse
                        )
                        .toList();

        List<BlockEditorDto.Contact> contacts =
                block.getContactAssignments()
                        .stream()
                        .map(
                                this::toContactResponse
                        )
                        .toList();

        Map<BlockSignalSide, BlockSignal> signals =
                signalRepository
                        .findByBlockId(
                                block.getId()
                        )
                        .stream()
                        .collect(
                                Collectors.toMap(
                                        BlockSignal::getSide,
                                        signal -> signal
                                )
                        );

        List<BlockEditorDto.Signal> signalResponses =
                Arrays.stream(
                                BlockSignalSide.values()
                        )
                        .map(
                                side -> {
                                    BlockSignal signal =
                                            signals.get(side);

                                    if (signal == null) {
                                        return new BlockEditorDto.Signal(
                                                null,
                                                side,
                                                BlockSignalType.NONE
                                        );
                                    }

                                    return toSignalResponse(
                                            signal
                                    );
                                }
                        )
                        .toList();

        return new BlockEditorDto.Response(
                block.getId(),
                block.getLayout().getId(),
                block.getName(),
                block.getLengthMm(),
                block.getDirection(),
                block.isShowSignals(),
                block.isVisibleOnlyInEditMode(),
                block.isRequestYellow(),
                block.getMaximumSpeedKmh(),
                block.getSlowSpeedKmh(),
                block.isIncludeInTrainTracking(),
                block.getMaximumTrainLengthMm(),
                block.getGridOrientation(),
                cells,
                markers,
                contacts,
                signalResponses
        );
    }

    private BlockEditorDto.Marker toMarkerResponse(
            BlockMarker marker
    ) {
        return new BlockEditorDto.Marker(
                marker.getId(),
                marker.getType(),
                marker.getPositionMm(),
                marker.getLengthMm(),
                marker.getDirection(),
                marker.getTrainPosition(),
                marker.isScheduledStop()
        );
    }

    private BlockEditorDto.Contact toContactResponse(
            BlockContactAssignment assignment
    ) {
        ContactDetector detector =
                assignment.getContactDetector();

        return new BlockEditorDto.Contact(
                assignment.getId(),
                detector.getId(),
                detector.getName(),
                detector.getType().name(),
                assignment.getRole(),
                assignment.getPositionMm(),
                assignment.getLengthMm()
        );
    }

    private BlockEditorDto.Signal toSignalResponse(
            BlockSignal signal
    ) {
        return new BlockEditorDto.Signal(
                signal.getId(),
                signal.getSide(),
                signal.getSignalType()
        );
    }
}
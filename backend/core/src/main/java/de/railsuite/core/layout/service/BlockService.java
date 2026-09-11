package de.railsuite.core.layout.service;

import de.railsuite.core.digital.entity.DigitalSystem;
import de.railsuite.core.digital.repository.DigitalSystemRepository;
import de.railsuite.core.layout.dto.*;
import de.railsuite.core.layout.entity.*;
import de.railsuite.core.layout.exception.LayoutNotFoundException;
import de.railsuite.core.layout.repository.*;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@Transactional
public class BlockService {

    private final LayoutRepository layoutRepository;
    private final BlockRepository blockRepository;
    private final BlockMarkerRepository markerRepository;
    private final ContactDetectorRepository detectorRepository;
    private final BlockContactAssignmentRepository assignmentRepository;
    private final DigitalSystemRepository digitalSystemRepository;

    public BlockService(
            LayoutRepository layoutRepository,
            BlockRepository blockRepository,
            BlockMarkerRepository markerRepository,
            ContactDetectorRepository detectorRepository,
            BlockContactAssignmentRepository assignmentRepository,
            DigitalSystemRepository digitalSystemRepository
    ) {
        this.layoutRepository =
                layoutRepository;
        this.blockRepository =
                blockRepository;
        this.markerRepository =
                markerRepository;
        this.detectorRepository =
                detectorRepository;
        this.assignmentRepository =
                assignmentRepository;
        this.digitalSystemRepository =
                digitalSystemRepository;
    }

    public List<BlockResponse> getBlocks(
            UUID layoutId
    ) {
        findLayout(layoutId);

        return blockRepository
                .findByLayoutIdOrderByNameAsc(
                        layoutId
                )
                .stream()
                .map(this::toBlockResponse)
                .toList();
    }

    public BlockResponse createBlock(
            UUID layoutId,
            CreateBlockRequest request
    ) {
        Layout layout =
                findLayout(layoutId);

        validateCells(
                layout,
                request.cells()
        );

        Block block =
                new Block(
                        layout,
                        request.name().trim(),
                        request.lengthMm(),
                        request.direction()
                );

        List<BlockCell> cells =
                new ArrayList<>();

        for (
                int index = 0;
                index < request.cells().size();
                index++
        ) {
            BlockCellRequest cell =
                    request.cells().get(index);

            cells.add(
                    new BlockCell(
                            block,
                            cell.x(),
                            cell.y(),
                            index
                    )
            );
        }

        block.replaceCells(cells);

        blockRepository.save(block);

        return toBlockResponse(block);
    }

    public BlockResponse updateBlock(
            UUID blockId,
            UpdateBlockRequest request
    ) {
        Block block =
                findBlock(blockId);

        block.update(
                request.name().trim(),
                request.lengthMm(),
                request.direction()
        );

        return toBlockResponse(block);
    }

    public void deleteBlock(
            UUID blockId
    ) {
        Block block =
                findBlock(blockId);

        blockRepository.delete(block);
    }

    public BlockMarkerResponse createMarker(
            UUID blockId,
            CreateBlockMarkerRequest request
    ) {
        Block block =
                findBlock(blockId);

        validateMarker(
                block,
                request.positionMm(),
                request.lengthMm()
        );

        BlockMarker marker =
                new BlockMarker(
                        block,
                        null,
                        request.type(),
                        request.positionMm(),
                        request.lengthMm(),
                        request.direction(),
                        BlockMarkerTrainPosition.FRONT,
                        false
                );

        markerRepository.save(marker);

        return toMarkerResponse(marker);
    }

    public BlockMarkerResponse updateMarker(
            UUID markerId,
            UpdateBlockMarkerRequest request
    ) {
        BlockMarker marker =
                markerRepository
                        .findById(markerId)
                        .orElseThrow();

        validateMarker(
                marker.getBlock(),
                request.positionMm(),
                request.lengthMm()
        );

        marker.update(
                null,
                request.type(),
                request.positionMm(),
                request.lengthMm(),
                request.direction(),
                marker.getTrainPosition(),
                marker.isScheduledStop()
        );

        return toMarkerResponse(marker);
    }

    public void deleteMarker(
            UUID markerId
    ) {
        markerRepository.deleteById(
                markerId
        );
    }

    public List<ContactDetectorResponse>
    getContactDetectors(
            UUID layoutId
    ) {
        findLayout(layoutId);

        return detectorRepository
                .findByLayoutIdOrderByNameAsc(
                        layoutId
                )
                .stream()
                .map(this::toDetectorResponse)
                .toList();
    }

    public ContactDetectorResponse
    createContactDetector(
            UUID layoutId,
            CreateContactDetectorRequest request
    ) {
        Layout layout =
                findLayout(layoutId);

        DigitalSystem system =
                resolveDigitalSystem(
                        request.digitalSystemId()
                );

        validateDetector(
                request.type(),
                system,
                request.digitalAddress()
        );

        ContactDetector detector =
                new ContactDetector(
                        layout,
                        request.name().trim(),
                        request.type(),
                        system,
                        request.digitalAddress()
                );

        detectorRepository.save(
                detector
        );

        return toDetectorResponse(
                detector
        );
    }

    public ContactDetectorResponse
    updateContactDetector(
            UUID layoutId,
            UUID detectorId,
            UpdateContactDetectorRequest request
    ) {
        Layout layout =
                findLayout(layoutId);

        ContactDetector detector =
                detectorRepository
                        .findById(detectorId)
                        .orElseThrow();

        if (
                !detector.getLayout()
                        .getId()
                        .equals(
                                layout.getId()
                        )
        ) {
            throw new IllegalArgumentException(
                    "Contact detector belongs to another layout"
            );
        }

        DigitalSystem system =
                resolveDigitalSystem(
                        request.digitalSystemId()
                );

        validateDetector(
                request.type(),
                system,
                request.digitalAddress()
        );

        detector.update(
                request.name().trim(),
                request.type(),
                system,
                request.digitalAddress()
        );

        return toDetectorResponse(
                detector
        );
    }

    public void deleteContactDetector(
            UUID detectorId
    ) {
        assignmentRepository
                .deleteByContactDetectorId(
                        detectorId
                );

        detectorRepository.deleteById(
                detectorId
        );
    }

    public BlockContactAssignmentResponse
    assignContactDetector(
            UUID blockId,
            CreateBlockContactAssignmentRequest request
    ) {
        Block block =
                findBlock(blockId);

        ContactDetector detector =
                detectorRepository
                        .findById(
                                request.contactDetectorId()
                        )
                        .orElseThrow();

        if (
                !detector.getLayout()
                        .getId()
                        .equals(
                                block.getLayout().getId()
                        )
        ) {
            throw new IllegalArgumentException(
                    "Contact detector belongs to another layout"
            );
        }

        if (
                request.positionMm() != null &&
                        (
                                request.positionMm() < 0 ||
                                        request.positionMm() >
                                                block.getLengthMm()
                        )
        ) {
            throw new IllegalArgumentException(
                    "Contact detector position is outside the block"
            );
        }

        BlockContactAssignment assignment =
                new BlockContactAssignment(
                        block,
                        detector,
                        request.role(),
                        request.positionMm()
                );

        assignmentRepository.save(
                assignment
        );

        return toAssignmentResponse(
                assignment
        );
    }

    public void deleteContactAssignment(
            UUID assignmentId
    ) {
        assignmentRepository.deleteById(
                assignmentId
        );
    }

    private void validateCells(
            Layout layout,
            List<BlockCellRequest> cells
    ) {
        if (
                cells == null ||
                        cells.isEmpty()
        ) {
            throw new IllegalArgumentException(
                    "A block must contain at least one cell"
            );
        }

        for (
                BlockCellRequest cell :
                cells
        ) {
            if (
                    cell.x() < 0 ||
                            cell.x() >= layout.getWidth() ||
                            cell.y() < 0 ||
                            cell.y() >= layout.getHeight()
            ) {
                throw new IllegalArgumentException(
                        "Block cell outside layout: "
                                + cell.x()
                                + ","
                                + cell.y()
                );
            }
        }
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
                lengthMm < 0
        ) {
            throw new IllegalArgumentException(
                    "Marker length must not be negative"
            );
        }

        if (
                positionMm + lengthMm >
                        block.getLengthMm()
        ) {
            throw new IllegalArgumentException(
                    "Marker exceeds block length"
            );
        }
    }

    private void validateDetector(
            ContactDetectorType type,
            DigitalSystem system,
            Integer address
    ) {
        if (
                type ==
                        ContactDetectorType.PHYSICAL
        ) {
            if (system == null) {
                throw new IllegalArgumentException(
                        "A physical contact detector requires a digital system"
                );
            }

            if (
                    address == null ||
                            address < 1
            ) {
                throw new IllegalArgumentException(
                        "A physical contact detector requires a digital address"
                );
            }
        }

        if (
                type ==
                        ContactDetectorType.VIRTUAL
        ) {
            if (
                    system != null ||
                            address != null
            ) {
                throw new IllegalArgumentException(
                        "A virtual contact detector cannot have a digital configuration"
                );
            }
        }
    }

    private DigitalSystem resolveDigitalSystem(
            UUID digitalSystemId
    ) {
        if (
                digitalSystemId == null
        ) {
            return null;
        }

        return digitalSystemRepository
                .findById(
                        digitalSystemId
                )
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "Digital system not found: "
                                        + digitalSystemId
                        )
                );
    }

    private Layout findLayout(
            UUID layoutId
    ) {
        return layoutRepository
                .findById(layoutId)
                .orElseThrow(() ->
                        new LayoutNotFoundException(
                                layoutId
                        )
                );
    }

    private Block findBlock(
            UUID blockId
    ) {
        return blockRepository
                .findById(blockId)
                .orElseThrow();
    }

    private BlockResponse toBlockResponse(
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

        List<BlockMarkerResponse> markers =
                block.getMarkers()
                        .stream()
                        .map(this::toMarkerResponse)
                        .toList();

        List<BlockContactAssignmentResponse>
                contacts =
                block.getContactAssignments()
                        .stream()
                        .map(
                                this::toAssignmentResponse
                        )
                        .toList();

        return new BlockResponse(
                block.getId(),
                block.getLayout().getId(),
                block.getName(),
                block.getLengthMm(),
                block.getDirection(),
                cells,
                markers,
                contacts
        );
    }

    private BlockMarkerResponse
    toMarkerResponse(
            BlockMarker marker
    ) {
        return new BlockMarkerResponse(
                marker.getId(),
                marker.getType(),
                marker.getPositionMm(),
                marker.getLengthMm(),
                marker.getDirection()
        );
    }

    private ContactDetectorResponse
    toDetectorResponse(
            ContactDetector detector
    ) {
        return new ContactDetectorResponse(
                detector.getId(),
                detector.getName(),
                detector.getType(),
                detector.getDigitalSystem() == null
                        ? null
                        : detector
                        .getDigitalSystem()
                        .getId(),
                detector.getDigitalSystem() == null
                        ? null
                        : detector
                        .getDigitalSystem()
                        .getName(),
                detector.getDigitalAddress()
        );
    }

    private BlockContactAssignmentResponse
    toAssignmentResponse(
            BlockContactAssignment assignment
    ) {
        ContactDetector detector =
                assignment
                        .getContactDetector();

        return new BlockContactAssignmentResponse(
                assignment.getId(),
                detector.getId(),
                detector.getName(),
                detector.getType().name(),
                assignment.getRole(),
                assignment.getPositionMm()
        );
    }
}
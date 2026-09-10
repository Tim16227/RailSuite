package de.railsuite.core.layout.controller;

import de.railsuite.core.layout.dto.*;
import de.railsuite.core.layout.service.BlockService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/layouts/{layoutId}")
public class BlockController {

    private final BlockService blockService;

    public BlockController(
            BlockService blockService
    ) {
        this.blockService =
                blockService;
    }

    @GetMapping("/blocks")
    public List<BlockResponse> getBlocks(
            @PathVariable UUID layoutId
    ) {
        return blockService.getBlocks(
                layoutId
        );
    }

    @PostMapping("/blocks")
    @ResponseStatus(HttpStatus.CREATED)
    public BlockResponse createBlock(
            @PathVariable UUID layoutId,
            @Valid @RequestBody
            CreateBlockRequest request
    ) {
        return blockService.createBlock(
                layoutId,
                request
        );
    }

    @PutMapping("/blocks/{blockId}")
    public BlockResponse updateBlock(
            @PathVariable UUID blockId,
            @Valid @RequestBody
            UpdateBlockRequest request
    ) {
        return blockService.updateBlock(
                blockId,
                request
        );
    }

    @DeleteMapping("/blocks/{blockId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteBlock(
            @PathVariable UUID blockId
    ) {
        blockService.deleteBlock(
                blockId
        );
    }

    @PostMapping("/blocks/{blockId}/markers")
    @ResponseStatus(HttpStatus.CREATED)
    public BlockMarkerResponse createMarker(
            @PathVariable UUID blockId,
            @Valid @RequestBody
            CreateBlockMarkerRequest request
    ) {
        return blockService.createMarker(
                blockId,
                request
        );
    }

    @PutMapping("/block-markers/{markerId}")
    public BlockMarkerResponse updateMarker(
            @PathVariable UUID markerId,
            @Valid @RequestBody
            UpdateBlockMarkerRequest request
    ) {
        return blockService.updateMarker(
                markerId,
                request
        );
    }

    @DeleteMapping("/block-markers/{markerId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteMarker(
            @PathVariable UUID markerId
    ) {
        blockService.deleteMarker(
                markerId
        );
    }

    @GetMapping("/contact-detectors")
    public List<ContactDetectorResponse>
    getContactDetectors(
            @PathVariable UUID layoutId
    ) {
        return blockService
                .getContactDetectors(
                        layoutId
                );
    }

    @PostMapping("/contact-detectors")
    @ResponseStatus(HttpStatus.CREATED)
    public ContactDetectorResponse
    createContactDetector(
            @PathVariable UUID layoutId,
            @Valid @RequestBody
            CreateContactDetectorRequest request
    ) {
        return blockService
                .createContactDetector(
                        layoutId,
                        request
                );
    }

    @DeleteMapping(
            "/contact-detectors/{detectorId}"
    )
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteContactDetector(
            @PathVariable UUID detectorId
    ) {
        blockService
                .deleteContactDetector(
                        detectorId
                );
    }

    @PostMapping(
            "/blocks/{blockId}/contacts"
    )
    @ResponseStatus(HttpStatus.CREATED)
    public BlockContactAssignmentResponse
    assignContactDetector(
            @PathVariable UUID blockId,
            @Valid @RequestBody
            CreateBlockContactAssignmentRequest request
    ) {
        return blockService
                .assignContactDetector(
                        blockId,
                        request
                );
    }

    @DeleteMapping(
            "/block-contact-assignments/{assignmentId}"
    )
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteContactAssignment(
            @PathVariable UUID assignmentId
    ) {
        blockService
                .deleteContactAssignment(
                        assignmentId
                );
    }
}
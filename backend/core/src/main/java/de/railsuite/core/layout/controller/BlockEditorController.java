package de.railsuite.core.layout.controller;

import de.railsuite.core.layout.dto.BlockEditorDto;
import de.railsuite.core.layout.entity.BlockSignalSide;
import de.railsuite.core.layout.service.BlockEditorService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping(
        "/api/layouts/{layoutId}/block-editor"
)
public class BlockEditorController {

    private final BlockEditorService service;

    public BlockEditorController(
            BlockEditorService service
    ) {
        this.service = service;
    }

    @GetMapping("/{blockId}")
    public BlockEditorDto.Response getBlock(
            @PathVariable UUID layoutId,
            @PathVariable UUID blockId
    ) {
        return service.getBlock(
                layoutId,
                blockId
        );
    }

    @PutMapping("/{blockId}")
    public BlockEditorDto.Response updateBlock(
            @PathVariable UUID layoutId,
            @PathVariable UUID blockId,
            @Valid @RequestBody
            BlockEditorDto.UpdateBlock request
    ) {
        return service.updateBlock(
                layoutId,
                blockId,
                request
        );
    }

    @PostMapping("/{blockId}/markers")
    @ResponseStatus(HttpStatus.CREATED)
    public BlockEditorDto.Marker createMarker(
            @PathVariable UUID layoutId,
            @PathVariable UUID blockId,
            @Valid @RequestBody
            BlockEditorDto.MarkerRequest request
    ) {
        return service.createMarker(
                layoutId,
                blockId,
                request
        );
    }

    @PutMapping("/markers/{markerId}")
    public BlockEditorDto.Marker updateMarker(
            @PathVariable UUID layoutId,
            @PathVariable UUID markerId,
            @Valid @RequestBody
            BlockEditorDto.MarkerRequest request
    ) {
        return service.updateMarker(
                layoutId,
                markerId,
                request
        );
    }

    @DeleteMapping("/markers/{markerId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteMarker(
            @PathVariable UUID layoutId,
            @PathVariable UUID markerId
    ) {
        service.deleteMarker(
                layoutId,
                markerId
        );
    }

    @PutMapping(
            "/{blockId}/contacts/{assignmentId}"
    )
    public BlockEditorDto.Contact updateContact(
            @PathVariable UUID layoutId,
            @PathVariable UUID assignmentId,
            @Valid @RequestBody
            BlockEditorDto.ContactRequest request
    ) {
        return service.updateContact(
                layoutId,
                assignmentId,
                request
        );
    }

    @PutMapping(
            "/{blockId}/signals/{side}"
    )
    public BlockEditorDto.Signal updateSignal(
            @PathVariable UUID layoutId,
            @PathVariable UUID blockId,
            @PathVariable BlockSignalSide side,
            @Valid @RequestBody
            BlockEditorDto.SignalRequest request
    ) {
        return service.updateSignal(
                layoutId,
                blockId,
                side,
                request
        );
    }
}
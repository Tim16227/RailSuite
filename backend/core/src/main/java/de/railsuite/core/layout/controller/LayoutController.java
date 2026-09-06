package de.railsuite.core.layout.controller;

import de.railsuite.core.digital.entity.TurnoutState;
import de.railsuite.core.digital.service.DigitalTurnoutService;
import de.railsuite.core.layout.dto.*;
import de.railsuite.core.layout.service.LayoutService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/layouts")
public class LayoutController {

    private final LayoutService layoutService;
    private final DigitalTurnoutService digitalTurnoutService;

    public LayoutController(
            LayoutService layoutService,
            DigitalTurnoutService digitalTurnoutService
    ) {
        this.layoutService = layoutService;
        this.digitalTurnoutService = digitalTurnoutService;
    }

    @GetMapping
    public List<LayoutResponse> getLayouts() {
        return layoutService.getLayouts();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public LayoutResponse createLayout(
            @Valid @RequestBody CreateLayoutRequest request
    ) {
        return layoutService.createLayout(request);
    }

    @GetMapping("/{layoutId}")
    public LayoutResponse getLayout(
            @PathVariable UUID layoutId
    ) {
        return layoutService.getLayout(layoutId);
    }

    @PutMapping("/{layoutId}")
    public LayoutResponse updateLayout(
            @PathVariable UUID layoutId,
            @Valid @RequestBody UpdateLayoutRequest request
    ) {
        return layoutService.updateLayout(
                layoutId,
                request
        );
    }

    @PutMapping("/{layoutId}/cells/{x}/{y}")
    public LayoutCellResponse setCell(
            @PathVariable UUID layoutId,
            @PathVariable int x,
            @PathVariable int y,
            @Valid @RequestBody SetLayoutCellRequest request
    ) {
        return layoutService.setCell(
                layoutId,
                x,
                y,
                request
        );
    }

    @DeleteMapping("/{layoutId}/cells/{x}/{y}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteCell(
            @PathVariable UUID layoutId,
            @PathVariable int x,
            @PathVariable int y
    ) {
        layoutService.deleteCell(
                layoutId,
                x,
                y
        );
    }

    @PostMapping("/{layoutId}/cells/{x}/{y}/turnout")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void setTurnout(
            @PathVariable UUID layoutId,
            @PathVariable int x,
            @PathVariable int y,
            @RequestParam TurnoutState state
    ) {
        digitalTurnoutService.setTurnout(
                layoutId,
                x,
                y,
                state
        );
    }
}
package de.railsuite.core.digital.controller;

import de.railsuite.core.digital.dto.CreateDigitalSystemRequest;
import de.railsuite.core.digital.dto.DigitalSystemResponse;
import de.railsuite.core.digital.dto.UpdateDigitalSystemRequest;
import de.railsuite.core.digital.service.DigitalSystemService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/digital-systems")
public class DigitalSystemController {

    private final DigitalSystemService digitalSystemService;

    public DigitalSystemController(
            DigitalSystemService digitalSystemService
    ) {
        this.digitalSystemService = digitalSystemService;
    }

    @GetMapping
    public List<DigitalSystemResponse> getDigitalSystems() {
        return digitalSystemService.getDigitalSystems();
    }

    @GetMapping("/{id}")
    public DigitalSystemResponse getDigitalSystem(
            @PathVariable UUID id
    ) {
        return digitalSystemService.getDigitalSystem(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public DigitalSystemResponse createDigitalSystem(
            @Valid @RequestBody CreateDigitalSystemRequest request
    ) {
        return digitalSystemService.createDigitalSystem(request);
    }

    @PutMapping("/{id}")
    public DigitalSystemResponse updateDigitalSystem(
            @PathVariable UUID id,
            @Valid @RequestBody UpdateDigitalSystemRequest request
    ) {
        return digitalSystemService.updateDigitalSystem(id, request);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteDigitalSystem(
            @PathVariable UUID id
    ) {
        digitalSystemService.deleteDigitalSystem(id);
    }
}
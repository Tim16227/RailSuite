package de.railsuite.core.digital.service;

import de.railsuite.core.digital.dto.CreateDigitalSystemRequest;
import de.railsuite.core.digital.dto.DigitalSystemResponse;
import de.railsuite.core.digital.dto.UpdateDigitalSystemRequest;
import de.railsuite.core.digital.entity.DigitalInterfaceType;
import de.railsuite.core.digital.entity.DigitalSystem;
import de.railsuite.core.digital.exception.DigitalSystemNotFoundException;
import de.railsuite.core.digital.mapper.DigitalSystemMapper;
import de.railsuite.core.digital.repository.DigitalSystemRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@Transactional
public class DigitalSystemService {

    private final DigitalSystemRepository repository;
    private final DigitalSystemMapper mapper;

    public DigitalSystemService(
            DigitalSystemRepository repository,
            DigitalSystemMapper mapper
    ) {
        this.repository = repository;
        this.mapper = mapper;
    }

    @Transactional(readOnly = true)
    public List<DigitalSystemResponse> getDigitalSystems() {
        return repository.findAll()
                .stream()
                .map(mapper::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public DigitalSystemResponse getDigitalSystem(UUID id) {
        return mapper.toResponse(findById(id));
    }

    public DigitalSystemResponse createDigitalSystem(
            CreateDigitalSystemRequest request
    ) {
        validateConnectionSettings(
                request.interfaceType(),
                request.host(),
                request.port()
        );

        DigitalSystem digitalSystem = new DigitalSystem(
                request.name(),
                request.manufacturer(),
                request.model(),
                request.interfaceType(),
                request.sendPause(),
                request.turnoutPause(),
                request.host(),
                request.port()
        );

        return mapper.toResponse(repository.save(digitalSystem));
    }

    public DigitalSystemResponse updateDigitalSystem(
            UUID id,
            UpdateDigitalSystemRequest request
    ) {
        DigitalSystem digitalSystem = findById(id);

        validateConnectionSettings(
                request.interfaceType(),
                request.host(),
                request.port()
        );

        digitalSystem.update(
                request.name(),
                request.manufacturer(),
                request.model(),
                request.interfaceType(),
                request.sendPause(),
                request.turnoutPause(),
                request.host(),
                request.port()
        );

        return mapper.toResponse(repository.save(digitalSystem));
    }

    public void deleteDigitalSystem(UUID id) {
        DigitalSystem digitalSystem = findById(id);
        repository.delete(digitalSystem);
    }

    private DigitalSystem findById(UUID id) {
        return repository.findById(id)
                .orElseThrow(() -> new DigitalSystemNotFoundException(id));
    }

    private void validateConnectionSettings(
            DigitalInterfaceType interfaceType,
            String host,
            Integer port
    ) {
        if (interfaceType == DigitalInterfaceType.NETWORK) {
            if (host == null || host.isBlank()) {
                throw new IllegalArgumentException(
                        "Host is required for network digital systems"
                );
            }

            if (port == null || port < 1 || port > 65535) {
                throw new IllegalArgumentException(
                        "A valid network port is required for network digital systems"
                );
            }
        }
    }
}
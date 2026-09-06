package de.railsuite.core.digital.mapper;

import de.railsuite.core.digital.dto.DigitalSystemResponse;
import de.railsuite.core.digital.entity.DigitalSystem;
import org.springframework.stereotype.Component;

@Component
public class DigitalSystemMapper {

    public DigitalSystemResponse toResponse(DigitalSystem digitalSystem) {
        return new DigitalSystemResponse(
                digitalSystem.getId(),
                digitalSystem.getName(),
                digitalSystem.getManufacturer(),
                digitalSystem.getModel(),
                digitalSystem.getInterfaceType(),
                digitalSystem.getSendPause(),
                digitalSystem.getTurnoutPause(),
                digitalSystem.getHost(),
                digitalSystem.getPort()
        );
    }
}
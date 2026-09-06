package de.railsuite.core.digital.dto;

import de.railsuite.core.digital.entity.TurnoutState;
import jakarta.validation.constraints.NotNull;

public record SetTurnoutStateRequest(
        @NotNull TurnoutState state
) {
}
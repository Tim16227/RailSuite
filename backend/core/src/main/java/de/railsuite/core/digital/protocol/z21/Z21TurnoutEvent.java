package de.railsuite.core.digital.protocol.z21;

import de.railsuite.core.digital.entity.TurnoutState;

import java.util.UUID;

public record Z21TurnoutEvent(
        UUID digitalSystemId,
        int digitalAddress,
        TurnoutState state
) {
}
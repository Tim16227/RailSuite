package de.railsuite.core.digital.communication;

import de.railsuite.core.digital.entity.DigitalSystem;
import de.railsuite.core.digital.entity.TurnoutState;

public interface DigitalCommandStation {

    void setTurnout(
            DigitalSystem digitalSystem,
            int digitalAddress,
            int digitalPort,
            TurnoutState state
    );
}
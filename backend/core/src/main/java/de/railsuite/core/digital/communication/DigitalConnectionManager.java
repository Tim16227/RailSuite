package de.railsuite.core.digital.communication;

import de.railsuite.core.digital.entity.DigitalInterfaceType;
import de.railsuite.core.digital.entity.DigitalSystem;
import de.railsuite.core.digital.protocol.z21.Z21CommandStation;
import org.springframework.stereotype.Service;

@Service
public class DigitalConnectionManager {

    private final Z21CommandStation z21CommandStation;

    public DigitalConnectionManager(
            Z21CommandStation z21CommandStation
    ) {
        this.z21CommandStation = z21CommandStation;
    }

    public DigitalCommandStation getConnection(
            DigitalSystem digitalSystem
    ) {

        if (digitalSystem == null) {
            throw new DigitalConnectionException(
                    "Digital system must not be null"
            );
        }

        if (digitalSystem.getInterfaceType()
                == DigitalInterfaceType.OFFLINE) {

            throw new DigitalConnectionException(
                    "Digital system is offline: "
                            + digitalSystem.getName()
            );
        }

        String manufacturer =
                digitalSystem.getManufacturer();

        String model =
                digitalSystem.getModel();

        if ("Roco/Fleischmann".equalsIgnoreCase(manufacturer)
                && "Z21".equalsIgnoreCase(model)) {

            return z21CommandStation;
        }

        throw new DigitalConnectionException(
                "No communication adapter available for "
                        + manufacturer
                        + " "
                        + model
        );
    }
}
package de.railsuite.core.digital.service;

import de.railsuite.core.digital.communication.DigitalCommandStation;
import de.railsuite.core.digital.communication.DigitalConnectionException;
import de.railsuite.core.digital.communication.DigitalConnectionManager;
import de.railsuite.core.digital.entity.TurnoutState;
import de.railsuite.core.layout.entity.LayoutCell;
import de.railsuite.core.layout.entity.LayoutElementType;
import de.railsuite.core.layout.repository.LayoutCellRepository;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@Transactional
public class DigitalTurnoutService {

    private final LayoutCellRepository layoutCellRepository;
    private final DigitalConnectionManager connectionManager;

    public DigitalTurnoutService(
            LayoutCellRepository layoutCellRepository,
            DigitalConnectionManager connectionManager
    ) {
        this.layoutCellRepository = layoutCellRepository;
        this.connectionManager = connectionManager;
    }

    public void setTurnout(
            UUID layoutId,
            int x,
            int y,
            TurnoutState state
    ) {
        LayoutCell cell =
                layoutCellRepository
                        .findByLayoutIdAndXAndY(
                                layoutId,
                                x,
                                y
                        )
                        .orElseThrow(() ->
                                new DigitalConnectionException(
                                        "Layout cell not found at "
                                                + x
                                                + ","
                                                + y
                                )
                        );

        if (cell.getElementType()
                != LayoutElementType.TURNOUT) {

            throw new DigitalConnectionException(
                    "Layout cell at "
                            + x
                            + ","
                            + y
                            + " is not a turnout"
            );
        }

        if (cell.getDigitalSystem() == null) {

            throw new DigitalConnectionException(
                    "No digital system configured for turnout at "
                            + x
                            + ","
                            + y
            );
        }

        if (cell.getDigitalAddress() == null) {

            throw new DigitalConnectionException(
                    "No digital address configured for turnout at "
                            + x
                            + ","
                            + y
            );
        }

        DigitalCommandStation commandStation =
                connectionManager.getConnection(
                        cell.getDigitalSystem()
                );

        commandStation.setTurnout(
                cell.getDigitalSystem(),
                cell.getDigitalAddress(),
                state
        );
    }
}
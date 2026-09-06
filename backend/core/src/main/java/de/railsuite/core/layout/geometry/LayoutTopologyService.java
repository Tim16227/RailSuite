package de.railsuite.core.layout.service;

import de.railsuite.core.layout.entity.Layout;
import de.railsuite.core.layout.entity.LayoutCell;
import de.railsuite.core.layout.geometry.LayoutElementGeometry;
import de.railsuite.core.layout.geometry.LayoutGeometryService;
import de.railsuite.core.layout.geometry.LayoutPort;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class LayoutTopologyService {

    private final LayoutGeometryService geometryService;

    public LayoutTopologyService(
            LayoutGeometryService geometryService
    ) {
        this.geometryService = geometryService;
    }

    public boolean areConnected(
            Layout layout,
            LayoutCell firstCell,
            LayoutPort firstPort
    ) {
        int neighborX =
                firstCell.getX() + firstPort.dx();

        int neighborY =
                firstCell.getY() + firstPort.dy();

        Optional<LayoutCell> neighbor =
                layout.getCells()
                        .stream()
                        .filter(cell ->
                                cell.getX() == neighborX &&
                                        cell.getY() == neighborY)
                        .findFirst();

        if (neighbor.isEmpty()) {
            return false;
        }

        LayoutCell secondCell = neighbor.get();

        LayoutElementGeometry geometry =
                geometryService.getGeometry(
                        secondCell.getElementType(),
                        secondCell.getOrientation(),
                        secondCell.getTurnoutHand()
                );

        return geometry.ports()
                .contains(firstPort.opposite());
    }
}
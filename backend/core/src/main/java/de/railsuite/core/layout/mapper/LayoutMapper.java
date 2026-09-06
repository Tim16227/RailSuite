package de.railsuite.core.layout.mapper;

import de.railsuite.core.digital.mapper.DigitalSystemMapper;
import de.railsuite.core.layout.dto.LayoutCellResponse;
import de.railsuite.core.layout.dto.LayoutConnectionResponse;
import de.railsuite.core.layout.dto.LayoutResponse;
import de.railsuite.core.layout.entity.Layout;
import de.railsuite.core.layout.entity.LayoutCell;
import de.railsuite.core.layout.geometry.LayoutConnection;
import de.railsuite.core.layout.geometry.LayoutElementGeometry;
import de.railsuite.core.layout.geometry.LayoutGeometryService;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class LayoutMapper {

    private final LayoutGeometryService geometryService;
    private final DigitalSystemMapper digitalSystemMapper;

    public LayoutMapper(
            LayoutGeometryService geometryService,
            DigitalSystemMapper digitalSystemMapper
    ) {
        this.geometryService = geometryService;
        this.digitalSystemMapper = digitalSystemMapper;
    }

    public LayoutCellResponse toResponse(LayoutCell cell) {
        LayoutElementGeometry geometry =
                geometryService.getGeometry(
                        cell.getElementType(),
                        cell.getOrientation(),
                        cell.getTurnoutHand()
                );

        List<LayoutConnectionResponse> connections =
                geometry.connections()
                        .stream()
                        .map(this::toConnectionResponse)
                        .toList();

        return new LayoutCellResponse(
                cell.getId(),
                cell.getX(),
                cell.getY(),
                cell.getElementType(),
                cell.getOrientation(),
                cell.getTurnoutHand(),
                cell.getDigitalSystem() == null
                        ? null
                        : digitalSystemMapper.toResponse(
                        cell.getDigitalSystem()
                ),
                cell.getDigitalAddress(),
                cell.getDigitalPort(),
                geometry.ports().stream().toList(),
                connections
        );
    }

    private LayoutConnectionResponse toConnectionResponse(
            LayoutConnection connection
    ) {
        return new LayoutConnectionResponse(
                connection.first(),
                connection.second()
        );
    }

    public LayoutResponse toResponse(Layout layout) {
        return new LayoutResponse(
                layout.getId(),
                layout.getName(),
                layout.getWidth(),
                layout.getHeight(),
                layout.getVersion(),
                layout.getCells()
                        .stream()
                        .map(this::toResponse)
                        .toList()
        );
    }
}
package de.railsuite.core.layout.service;

import de.railsuite.core.digital.entity.DigitalSystem;
import de.railsuite.core.digital.repository.DigitalSystemRepository;
import de.railsuite.core.layout.dto.*;
import de.railsuite.core.layout.entity.Layout;
import de.railsuite.core.layout.entity.LayoutCell;
import de.railsuite.core.layout.entity.LayoutElementType;
import de.railsuite.core.layout.exception.InvalidLayoutCellException;
import de.railsuite.core.layout.exception.LayoutNotFoundException;
import de.railsuite.core.layout.mapper.LayoutMapper;
import de.railsuite.core.layout.repository.LayoutCellRepository;
import de.railsuite.core.layout.repository.LayoutRepository;

import jakarta.transaction.Transactional;

import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
@Transactional
public class LayoutService {

    private final LayoutRepository layoutRepository;
    private final LayoutCellRepository cellRepository;
    private final DigitalSystemRepository digitalSystemRepository;
    private final LayoutMapper mapper;

    public LayoutService(
            LayoutRepository layoutRepository,
            LayoutCellRepository cellRepository,
            DigitalSystemRepository digitalSystemRepository,
            LayoutMapper mapper
    ) {
        this.layoutRepository = layoutRepository;
        this.cellRepository = cellRepository;
        this.digitalSystemRepository = digitalSystemRepository;
        this.mapper = mapper;
    }

    public LayoutResponse createLayout(
            CreateLayoutRequest request
    ) {
        Layout layout =
                new Layout(
                        request.name(),
                        request.width(),
                        request.height()
                );

        layoutRepository.save(layout);

        return mapper.toResponse(layout);
    }

    @Transactional
    public LayoutResponse getLayout(
            UUID layoutId
    ) {
        Layout layout =
                findLayout(layoutId);

        return mapper.toResponse(layout);
    }

    public List<LayoutResponse> getLayouts() {
        return layoutRepository.findAll()
                .stream()
                .map(mapper::toResponse)
                .toList();
    }

    public LayoutResponse updateLayout(
            UUID layoutId,
            UpdateLayoutRequest request
    ) {
        Layout layout =
                findLayout(layoutId);

        layout.setName(
                request.name()
        );

        return mapper.toResponse(layout);
    }

    public LayoutCellResponse setCell(
            UUID layoutId,
            int x,
            int y,
            SetLayoutCellRequest request
    ) {
        Layout layout =
                findLayout(layoutId);

        validateCoordinates(
                layout,
                x,
                y
        );

        LayoutCell cell =
                cellRepository
                        .findByLayoutIdAndXAndY(
                                layoutId,
                                x,
                                y
                        )
                        .orElseGet(() ->
                                new LayoutCell(
                                        layout,
                                        x,
                                        y,
                                        request.elementType(),
                                        request.orientation()
                                )
                        );

        cell.update(
                request.elementType(),
                request.orientation()
        );

        cell.setTurnoutHand(
                request.turnoutHand()
        );

        if (request.elementType()
                == LayoutElementType.TURNOUT) {

            cell.setDigitalAddress(
                    request.digitalAddress()
            );

            cell.setDigitalSystem(
                    request.digitalSystemId() == null
                            ? null
                            : findDigitalSystem(
                            request.digitalSystemId()
                    )
            );

            /*
             * Legacy-Feld.
             *
             * Die sichtbare RailSuite-Adresse ist NICHT
             * mehr an einen Port gekoppelt.
             *
             * Das alte Feld bleibt nur erhalten, damit
             * das bestehende Frontend und die bestehende
             * Datenbank kompatibel bleiben.
             */
            cell.setDigitalPort(
                    request.digitalAddress() == null
                            ? null
                            : 1
            );

        } else {

            cell.setDigitalSystem(null);
            cell.setDigitalAddress(null);
            cell.setDigitalPort(null);
        }

        validateDigitalConfiguration(
                cell
        );

        cellRepository.save(cell);

        return mapper.toResponse(cell);
    }

    public void deleteCell(
            UUID layoutId,
            int x,
            int y
    ) {
        Layout layout =
                findLayout(layoutId);

        validateCoordinates(
                layout,
                x,
                y
        );

        cellRepository.deleteByLayoutIdAndXAndY(
                layoutId,
                x,
                y
        );
    }

    private DigitalSystem findDigitalSystem(
            UUID digitalSystemId
    ) {
        return digitalSystemRepository
                .findById(digitalSystemId)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "Digital system not found: "
                                        + digitalSystemId
                        )
                );
    }

    private void validateDigitalConfiguration(
            LayoutCell cell
    ) {
        if (cell.getElementType()
                != LayoutElementType.TURNOUT) {
            return;
        }

        boolean hasSystem =
                cell.getDigitalSystem() != null;

        boolean hasAddress =
                cell.getDigitalAddress() != null;

        if (!hasSystem && !hasAddress) {
            return;
        }

        if (!hasSystem) {
            throw new InvalidLayoutCellException(
                    "A turnout digital system is required"
            );
        }

        if (!hasAddress) {
            throw new InvalidLayoutCellException(
                    "A turnout digital address is required"
            );
        }
    }

    private Layout findLayout(
            UUID layoutId
    ) {
        return layoutRepository
                .findById(layoutId)
                .orElseThrow(() ->
                        new LayoutNotFoundException(
                                layoutId
                        )
                );
    }

    private void validateCoordinates(
            Layout layout,
            int x,
            int y
    ) {
        if (x < 0
                || x >= layout.getWidth()) {

            throw new InvalidLayoutCellException(
                    "X coordinate outside layout: "
                            + x
            );
        }

        if (y < 0
                || y >= layout.getHeight()) {

            throw new InvalidLayoutCellException(
                    "Y coordinate outside layout: "
                            + y
            );
        }
    }
}
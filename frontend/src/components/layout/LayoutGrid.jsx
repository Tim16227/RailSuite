import {
    useRef,
    useState,
} from "react";

import {
    LayoutElementType,
    Tool,
} from "../../models/layout";

import {
    setLayoutTurnout,
} from "../../api/layoutApi";

import {
    TrackElementRenderer,
} from "./geometry/TrackElementRenderer";

import "../../styles/layout-editor.css";

const CELL_SIZE = 40;

export function LayoutGrid({
    layout,
    tool,
    editMode,
    onStrokeComplete,
    onCellAction,
    onTurnoutDoubleClick,
}) {
    const svgRef =
        useRef(null);

    const [
        previewLine,
        setPreviewLine,
    ] = useState(null);

    const [
        turnoutStates,
        setTurnoutStates,
    ] = useState({});

    const [
        switchingTurnout,
        setSwitchingTurnout,
    ] = useState(null);

    const pointerStateRef =
        useRef({
            active: false,
            pointerId: null,
            points: [],
            lastCell: null,
            startPixel: null,
        });

    if (!layout) {
        return null;
    }

    function getCellFromPointer(
        event
    ) {
        const svg =
            svgRef.current;

        if (!svg) {
            return null;
        }

        const rect =
            svg.getBoundingClientRect();

        const localX =
            event.clientX -
            rect.left;

        const localY =
            event.clientY -
            rect.top;

        const x =
            Math.floor(
                localX /
                    CELL_SIZE
            );

        const y =
            Math.floor(
                localY /
                    CELL_SIZE
            );

        if (
            x < 0 ||
            y < 0 ||
            x >= layout.width ||
            y >= layout.height
        ) {
            return null;
        }

        return {
            x,
            y,
        };
    }

    function findCell(
        point
    ) {
        return layout.cells.find(
            (cell) =>
                cell.x ===
                    point.x &&
                cell.y ===
                    point.y
        );
    }

    function getTurnoutState(
        cell
    ) {
        if (!cell) {
            return "LEFT";
        }

        return (
            turnoutStates[cell.id] ??
            cell.turnoutState ??
            "LEFT"
        );
    }

    async function handleTurnoutClick(
        cell
    ) {
        if (!cell) {
            return;
        }

        if (
            cell.elementType !==
            LayoutElementType.TURNOUT
        ) {
            return;
        }

        /*
         * Bereits laufenden Stellvorgang
         * nicht doppelt auslösen.
         */
        if (
            switchingTurnout ===
            cell.id
        ) {
            return;
        }

        const currentState =
            getTurnoutState(
                cell
            );

        const nextState =
            currentState ===
            "LEFT"
                ? "RIGHT"
                : "LEFT";

        /*
         * Ohne digitale Zuordnung kann
         * das Backend die Weiche nicht
         * stellen.
         *
         * Wir lassen den Klick trotzdem
         * nicht einfach optisch umspringen.
         */
        if (
            cell.digitalSystem == null ||
            cell.digitalAddress == null
        ) {
            console.warn(
                "Weiche besitzt keine digitale Zuordnung:",
                cell
            );

            return;
        }

        try {
            setSwitchingTurnout(
                cell.id
            );

            await setLayoutTurnout(
                layout.id,
                cell.x,
                cell.y,
                nextState
            );

            /*
             * Erst wenn das Backend den
             * Befehl akzeptiert hat, ändern
             * wir die Darstellung.
             */
            setTurnoutStates(
                (current) => ({
                    ...current,
                    [cell.id]:
                        nextState,
                })
            );
        } catch (error) {
            console.error(
                "Fehler beim Stellen der Weiche:",
                error
            );
        } finally {
            setSwitchingTurnout(
                null
            );
        }
    }

    function getCellsBetween(
        start,
        end
    ) {
        if (
            !start ||
            !end
        ) {
            return [];
        }

        const dx =
            end.x -
            start.x;

        const dy =
            end.y -
            start.y;

        if (
            dx === 0 &&
            dy === 0
        ) {
            return [
                {
                    ...start,
                },
            ];
        }

        const absDx =
            Math.abs(dx);

        const absDy =
            Math.abs(dy);

        if (
            absDx === absDy &&
            absDx > 0
        ) {
            const stepX =
                dx > 0
                    ? 1
                    : -1;

            const stepY =
                dy > 0
                    ? 1
                    : -1;

            const cells = [];

            for (
                let i = 0;
                i <= absDx;
                i++
            ) {
                cells.push({
                    x:
                        start.x +
                        stepX * i,

                    y:
                        start.y +
                        stepY * i,
                });
            }

            return cells;
        }

        if (dy === 0) {
            const stepX =
                dx > 0
                    ? 1
                    : -1;

            const cells = [];

            for (
                let i = 0;
                i <= absDx;
                i++
            ) {
                cells.push({
                    x:
                        start.x +
                        stepX * i,

                    y:
                        start.y,
                });
            }

            return cells;
        }

        if (dx === 0) {
            const stepY =
                dy > 0
                    ? 1
                    : -1;

            const cells = [];

            for (
                let i = 0;
                i <= absDy;
                i++
            ) {
                cells.push({
                    x:
                        start.x,

                    y:
                        start.y +
                        stepY * i,
                });
            }

            return cells;
        }

        if (
            absDx > absDy
        ) {
            const stepX =
                dx > 0
                    ? 1
                    : -1;

            const cells = [];

            for (
                let i = 0;
                i <= absDx;
                i++
            ) {
                const progress =
                    absDx === 0
                        ? 0
                        : i /
                          absDx;

                const interpolatedY =
                    start.y +
                    dy *
                        progress;

                const y =
                    Math.round(
                        interpolatedY
                    );

                cells.push({
                    x:
                        start.x +
                        stepX * i,

                    y,
                });
            }

            return removeDuplicateCells(
                cells
            );
        }

        const stepY =
            dy > 0
                ? 1
                : -1;

        const cells = [];

        for (
            let i = 0;
            i <= absDy;
            i++
        ) {
            const progress =
                absDy === 0
                    ? 0
                    : i /
                      absDy;

            const interpolatedX =
                start.x +
                dx *
                    progress;

            const x =
                Math.round(
                    interpolatedX
                );

            cells.push({
                x,

                y:
                    start.y +
                    stepY * i,
            });
        }

        return removeDuplicateCells(
            cells
        );
    }

    function removeDuplicateCells(
        cells
    ) {
        const result = [];

        for (
            const cell of cells
        ) {
            const last =
                result[
                    result.length -
                        1
                ];

            if (
                !last ||
                last.x !==
                    cell.x ||
                last.y !==
                    cell.y
            ) {
                result.push(
                    cell
                );
            }
        }

        return result;
    }

    function addCellsToStroke(
        cells
    ) {
        const state =
            pointerStateRef.current;

        for (
            const cell of cells
        ) {
            if (
                cell.x < 0 ||
                cell.y < 0 ||
                cell.x >=
                    layout.width ||
                cell.y >=
                    layout.height
            ) {
                continue;
            }

            const last =
                state.points[
                    state.points.length -
                        1
                ];

            if (
                last &&
                last.x ===
                    cell.x &&
                last.y ===
                    cell.y
            ) {
                continue;
            }

            state.points.push(
                cell
            );
        }
    }

    function getSnappedPreviewEnd(
        startPixel,
        currentPixel
    ) {
        if (
            !startPixel ||
            !currentPixel
        ) {
            return currentPixel;
        }

        const dx =
            currentPixel.x -
            startPixel.x;

        const dy =
            currentPixel.y -
            startPixel.y;

        if (
            dx === 0 &&
            dy === 0
        ) {
            return currentPixel;
        }

        const distance =
            Math.sqrt(
                dx * dx +
                    dy * dy
            );

        const angle =
            Math.atan2(
                dy,
                dx
            );

        const step =
            Math.PI / 4;

        const snappedAngle =
            Math.round(
                angle / step
            ) * step;

        return {
            x:
                startPixel.x +
                Math.cos(
                    snappedAngle
                ) *
                    distance,

            y:
                startPixel.y +
                Math.sin(
                    snappedAngle
                ) *
                    distance,
        };
    }

    function updatePreview(
        event
    ) {
        const state =
            pointerStateRef.current;

        if (
            !state.startPixel
        ) {
            return;
        }

        const svg =
            svgRef.current;

        if (!svg) {
            return;
        }

        const rect =
            svg.getBoundingClientRect();

        const currentPixel = {
            x:
                event.clientX -
                rect.left,

            y:
                event.clientY -
                rect.top,
        };

        const snappedEnd =
            getSnappedPreviewEnd(
                state.startPixel,
                currentPixel
            );

        setPreviewLine({
            start:
                state.startPixel,

            end:
                snappedEnd,
        });
    }

        function handleDoubleClick(
            event
        ) {
            if (!editMode) {
                return;
            }

            const cell =
                getCellFromPointer(
                    event
                );

            if (!cell) {
                return;
            }

            const layoutCell =
                findCell(cell);

            if (
                !layoutCell ||
                layoutCell.elementType !==
                    LayoutElementType.TURNOUT
            ) {
                return;
            }

            event.preventDefault();
            event.stopPropagation();

            if (
                onTurnoutDoubleClick
            ) {
                onTurnoutDoubleClick(
                    layoutCell
                );
            }
        }

    function handlePointerDown(
        event
    ) {
        const cell =
            getCellFromPointer(
                event
            );

        if (!cell) {
            return;
        }

        const layoutCell =
            findCell(cell);

        /*
         * ==========================
         * BETRIEBSMODUS
         * ==========================
         *
         * Nur Weichen reagieren.
         */
        if (!editMode) {
            if (
                layoutCell?.elementType ===
                LayoutElementType.TURNOUT
            ) {
                void handleTurnoutClick(
                    layoutCell
                );
            }

            return;
        }

        /*
         * ==========================
         * EDITIERMODUS
         * ==========================
         */

        if (
            tool !== Tool.PEN &&
            tool !== Tool.ERASER
        ) {
            onCellAction(
                cell
            );

            return;
        }

        const svg =
            svgRef.current;

        if (!svg) {
            return;
        }

        const rect =
            svg.getBoundingClientRect();

        const startPixel = {
            x:
                event.clientX -
                rect.left,

            y:
                event.clientY -
                rect.top,
        };

        event.currentTarget.setPointerCapture(
            event.pointerId
        );

        pointerStateRef.current = {
            active: true,
            pointerId:
                event.pointerId,
            points: [],
            lastCell: null,
            startPixel,
        };

        addCellsToStroke([
            cell,
        ]);

        pointerStateRef.current.lastCell =
            cell;

        setPreviewLine({
            start:
                startPixel,

            end:
                startPixel,
        });
    }

    function handlePointerMove(
        event
    ) {
        if (!editMode) {
            return;
        }

        const state =
            pointerStateRef.current;

        if (!state.active) {
            return;
        }

        if (
            state.pointerId !==
            event.pointerId
        ) {
            return;
        }

        updatePreview(
            event
        );

        const cell =
            getCellFromPointer(
                event
            );

        if (!cell) {
            return;
        }

        const lastCell =
            state.lastCell;

        if (
            lastCell &&
            lastCell.x ===
                cell.x &&
            lastCell.y ===
                cell.y
        ) {
            return;
        }

        const cells =
            getCellsBetween(
                lastCell,
                cell
            );

        addCellsToStroke(
            cells
        );

        state.lastCell =
            cell;
    }

    function finishPointerStroke(
        event
    ) {
        const state =
            pointerStateRef.current;

        if (!state.active) {
            return;
        }

        if (
            state.pointerId !==
            event.pointerId
        ) {
            return;
        }

        const points = [
            ...state.points,
        ];

        pointerStateRef.current = {
            active: false,
            pointerId: null,
            points: [],
            lastCell: null,
            startPixel: null,
        };

        setPreviewLine(
            null
        );

        if (
            event.currentTarget.hasPointerCapture(
                event.pointerId
            )
        ) {
            event.currentTarget.releasePointerCapture(
                event.pointerId
            );
        }

        if (
            points.length === 0
        ) {
            return;
        }

        if (!editMode) {
            return;
        }

        onStrokeComplete(
            points
        );
    }

    function handlePointerUp(
        event
    ) {
        finishPointerStroke(
            event
        );
    }

    function handlePointerCancel(
        event
    ) {
        finishPointerStroke(
            event
        );
    }

    function renderPreview() {
        if (
            !previewLine ||
            !editMode
        ) {
            return null;
        }

        return (
            <g
                className="layout-track-preview"
                pointerEvents="none"
            >
                <line
                    className="layout-track-preview-line"
                    x1={
                        previewLine
                            .start.x
                    }
                    y1={
                        previewLine
                            .start.y
                    }
                    x2={
                        previewLine
                            .end.x
                    }
                    y2={
                        previewLine
                            .end.y
                    }
                />

                <circle
                    className="layout-track-preview-point"
                    cx={
                        previewLine
                            .start.x
                    }
                    cy={
                        previewLine
                            .start.y
                    }
                    r="4"
                />

                <circle
                    className="layout-track-preview-point"
                    cx={
                        previewLine
                            .end.x
                    }
                    cy={
                        previewLine
                            .end.y
                    }
                    r="4"
                />
            </g>
        );
    }

    return (
        <div
            className={
                `layout-grid ${
                    editMode
                        ? "layout-grid-edit-mode"
                        : "layout-grid-operation-mode"
                }`
            }
            style={{
                width:
                    layout.width *
                    CELL_SIZE,

                height:
                    layout.height *
                    CELL_SIZE,
            }}
        >
            <div
                className="layout-grid-background"
                style={{
                    width:
                        layout.width *
                        CELL_SIZE,

                    height:
                        layout.height *
                        CELL_SIZE,

                    gridTemplateColumns:
                        `repeat(${layout.width}, ${CELL_SIZE}px)`,

                    gridTemplateRows:
                        `repeat(${layout.height}, ${CELL_SIZE}px)`,
                }}
            >
                {Array.from(
                    {
                        length:
                            layout.width *
                            layout.height,
                    },
                    (_, index) => (
                        <div
                            key={index}
                            className="layout-cell-background"
                        />
                    )
                )}
            </div>

            <svg
                ref={svgRef}
                className="layout-track-layer"
                width={
                    layout.width *
                    CELL_SIZE
                }
                height={
                    layout.height *
                    CELL_SIZE
                }
                viewBox={
                    `0 0 ${
                        layout.width *
                        CELL_SIZE
                    } ${
                        layout.height *
                        CELL_SIZE
                    }`
                }
                onPointerDown={
                    handlePointerDown
                }
                onPointerMove={
                    handlePointerMove
                }
                onPointerUp={
                    handlePointerUp
                }
                onPointerCancel={
                    handlePointerCancel
                }
                onDoubleClick={
                    handleDoubleClick
                }
            >
                {layout.cells.map(
                    (cell) => (
                        <g
                            key={
                                cell.id
                            }
                            transform={
                                `translate(${
                                    cell.x *
                                    CELL_SIZE
                                } ${
                                    cell.y *
                                    CELL_SIZE
                                })`
                            }
                        >
                            <TrackElementRenderer
                                cell={{
                                    ...cell,
                                    turnoutState:
                                        getTurnoutState(
                                            cell
                                        ),
                                }}
                                size={
                                    CELL_SIZE
                                }
                            />
                        </g>
                    )
                )}

                {renderPreview()}
            </svg>
        </div>
    );
}
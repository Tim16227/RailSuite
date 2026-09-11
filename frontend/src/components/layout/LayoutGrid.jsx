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

const SELECTION_HANDLE_RADIUS = 4;

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

    /*
     * ---------------------------------------------------------
     * AUSWAHL
     * ---------------------------------------------------------
     *
     * Die Auswahl wird als Zellbereich gespeichert.
     *
     * Beispiel:
     *
     * {
     *     minX: 2,
     *     minY: 3,
     *     maxX: 6,
     *     maxY: 7
     * }
     *
     * Damit können wir später sehr einfach
     * mehrere Zellen gemeinsam bearbeiten.
     */

    const [
        selectedRange,
        setSelectedRange,
    ] = useState(null);

    /*
     * Zustand für das Ziehen eines
     * Auswahl-Griffes.
     */
    const selectionDragRef =
        useRef({
            active: false,
            pointerId: null,
            handle: null,
            anchor: null,
        });

    /*
     * Zustand für die normalen Zeichenwerkzeuge.
     */
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

    /*
     * ---------------------------------------------------------
     * ZELLENPOSITION
     * ---------------------------------------------------------
     */

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

    /*
     * ---------------------------------------------------------
     * WEICHEN
     * ---------------------------------------------------------
     */

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

    /*
     * ---------------------------------------------------------
     * AUSWAHL
     * ---------------------------------------------------------
     */

    function createSingleCellSelection(
        cell
    ) {
        if (!cell) {
            return;
        }

        setSelectedRange({
            minX: cell.x,
            minY: cell.y,
            maxX: cell.x,
            maxY: cell.y,
        });
    }

    function clamp(
        value,
        min,
        max
    ) {
        return Math.max(
            min,
            Math.min(
                max,
                value
            )
        );
    }

    function getSelectionBounds() {
        if (!selectedRange) {
            return null;
        }

        return {
            minX: Math.min(
                selectedRange.minX,
                selectedRange.maxX
            ),

            minY: Math.min(
                selectedRange.minY,
                selectedRange.maxY
            ),

            maxX: Math.max(
                selectedRange.minX,
                selectedRange.maxX
            ),

            maxY: Math.max(
                selectedRange.minY,
                selectedRange.maxY
            ),
        };
    }

    function getSelectionPixelRect() {
        const bounds =
            getSelectionBounds();

        if (!bounds) {
            return null;
        }

        return {
            x:
                bounds.minX *
                CELL_SIZE,

            y:
                bounds.minY *
                CELL_SIZE,

            width:
                (
                    bounds.maxX -
                    bounds.minX +
                    1
                ) *
                CELL_SIZE,

            height:
                (
                    bounds.maxY -
                    bounds.minY +
                    1
                ) *
                CELL_SIZE,
        };
    }

    /*
     * Positionen der acht Griffe.
     *
     * Die Namen sind bewusst eindeutig,
     * damit die Berechnung beim Ziehen
     * einfach bleibt.
     */
    function getSelectionHandles() {
        const rect =
            getSelectionPixelRect();

        if (!rect) {
            return [];
        }

        const left =
            rect.x;

        const right =
            rect.x +
            rect.width;

        const top =
            rect.y;

        const bottom =
            rect.y +
            rect.height;

        const centerX =
            rect.x +
            rect.width / 2;

        const centerY =
            rect.y +
            rect.height / 2;

        return [
            {
                name: "TOP_LEFT",
                x: left,
                y: top,
            },

            {
                name: "TOP",
                x: centerX,
                y: top,
            },

            {
                name: "TOP_RIGHT",
                x: right,
                y: top,
            },

            {
                name: "RIGHT",
                x: right,
                y: centerY,
            },

            {
                name: "BOTTOM_RIGHT",
                x: right,
                y: bottom,
            },

            {
                name: "BOTTOM",
                x: centerX,
                y: bottom,
            },

            {
                name: "BOTTOM_LEFT",
                x: left,
                y: bottom,
            },

            {
                name: "LEFT",
                x: left,
                y: centerY,
            },
        ];
    }

    function startSelectionHandleDrag(
        event,
        handle
    ) {
        if (
            !editMode ||
            tool !== Tool.NONE ||
            !selectedRange
        ) {
            return;
        }

        event.preventDefault();
        event.stopPropagation();

        const bounds =
            getSelectionBounds();

        if (!bounds) {
            return;
        }

        /*
         * Der gegenüberliegende Punkt bleibt
         * beim Ziehen fixiert.
         */
        let anchor;

        switch (handle.name) {
            case "TOP_LEFT":
                anchor = {
                    x: bounds.maxX,
                    y: bounds.maxY,
                };
                break;

            case "TOP":
                anchor = {
                    x: null,
                    y: bounds.maxY,
                };
                break;

            case "TOP_RIGHT":
                anchor = {
                    x: bounds.minX,
                    y: bounds.maxY,
                };
                break;

            case "RIGHT":
                anchor = {
                    x: bounds.minX,
                    y: null,
                };
                break;

            case "BOTTOM_RIGHT":
                anchor = {
                    x: bounds.minX,
                    y: bounds.minY,
                };
                break;

            case "BOTTOM":
                anchor = {
                    x: null,
                    y: bounds.minY,
                };
                break;

            case "BOTTOM_LEFT":
                anchor = {
                    x: bounds.maxX,
                    y: bounds.minY,
                };
                break;

            case "LEFT":
                anchor = {
                    x: bounds.maxX,
                    y: null,
                };
                break;

            default:
                return;
        }

        selectionDragRef.current = {
            active: true,
            pointerId:
                event.pointerId,
            handle:
                handle.name,
            anchor,
        };

        event.currentTarget.setPointerCapture(
            event.pointerId
        );
    }

    function updateSelectionFromHandle(
        event
    ) {
        const state =
            selectionDragRef.current;

        if (
            !state.active ||
            state.pointerId !==
                event.pointerId
        ) {
            return;
        }

        const cell =
            getCellFromPointer(
                event
            );

        if (!cell) {
            return;
        }

        const anchor =
            state.anchor;

        let minX;
        let maxX;
        let minY;
        let maxY;

        switch (state.handle) {
            case "TOP_LEFT":
                minX = Math.min(
                    cell.x,
                    anchor.x
                );

                maxX = Math.max(
                    cell.x,
                    anchor.x
                );

                minY = Math.min(
                    cell.y,
                    anchor.y
                );

                maxY = Math.max(
                    cell.y,
                    anchor.y
                );
                break;

            case "TOP":
                minX =
                    selectedRange.minX;

                maxX =
                    selectedRange.maxX;

                minY = Math.min(
                    cell.y,
                    anchor.y
                );

                maxY = Math.max(
                    cell.y,
                    anchor.y
                );
                break;

            case "TOP_RIGHT":
                minX = Math.min(
                    cell.x,
                    anchor.x
                );

                maxX = Math.max(
                    cell.x,
                    anchor.x
                );

                minY = Math.min(
                    cell.y,
                    anchor.y
                );

                maxY = Math.max(
                    cell.y,
                    anchor.y
                );
                break;

            case "RIGHT":
                minX = Math.min(
                    cell.x,
                    anchor.x
                );

                maxX = Math.max(
                    cell.x,
                    anchor.x
                );

                minY =
                    selectedRange.minY;

                maxY =
                    selectedRange.maxY;
                break;

            case "BOTTOM_RIGHT":
                minX = Math.min(
                    cell.x,
                    anchor.x
                );

                maxX = Math.max(
                    cell.x,
                    anchor.x
                );

                minY = Math.min(
                    cell.y,
                    anchor.y
                );

                maxY = Math.max(
                    cell.y,
                    anchor.y
                );
                break;

            case "BOTTOM":
                minX =
                    selectedRange.minX;

                maxX =
                    selectedRange.maxX;

                minY = Math.min(
                    cell.y,
                    anchor.y
                );

                maxY = Math.max(
                    cell.y,
                    anchor.y
                );
                break;

            case "BOTTOM_LEFT":
                minX = Math.min(
                    cell.x,
                    anchor.x
                );

                maxX = Math.max(
                    cell.x,
                    anchor.x
                );

                minY = Math.min(
                    cell.y,
                    anchor.y
                );

                maxY = Math.max(
                    cell.y,
                    anchor.y
                );
                break;

            case "LEFT":
                minX = Math.min(
                    cell.x,
                    anchor.x
                );

                maxX = Math.max(
                    cell.x,
                    anchor.x
                );

                minY =
                    selectedRange.minY;

                maxY =
                    selectedRange.maxY;
                break;

            default:
                return;
        }

        minX = clamp(
            minX,
            0,
            layout.width - 1
        );

        maxX = clamp(
            maxX,
            0,
            layout.width - 1
        );

        minY = clamp(
            minY,
            0,
            layout.height - 1
        );

        maxY = clamp(
            maxY,
            0,
            layout.height - 1
        );

        setSelectedRange({
            minX,
            minY,
            maxX,
            maxY,
        });
    }

    function finishSelectionHandleDrag(
        event
    ) {
        const state =
            selectionDragRef.current;

        if (
            !state.active ||
            state.pointerId !==
                event.pointerId
        ) {
            return;
        }

        selectionDragRef.current = {
            active: false,
            pointerId: null,
            handle: null,
            anchor: null,
        };

        if (
            event.currentTarget.hasPointerCapture(
                event.pointerId
            )
        ) {
            event.currentTarget.releasePointerCapture(
                event.pointerId
            );
        }
    }

    function handleSelectionPointerMove(
        event
    ) {
        if (
            !selectionDragRef.current
                .active
        ) {
            return;
        }

        updateSelectionFromHandle(
            event
        );
    }

    function handleSelectionPointerUp(
        event
    ) {
        finishSelectionHandleDrag(
            event
        );
    }

    function renderSelection() {
        if (
            !editMode ||
            tool !== Tool.NONE ||
            !selectedRange
        ) {
            return null;
        }

        const rect =
            getSelectionPixelRect();

        if (!rect) {
            return null;
        }

        const handles =
            getSelectionHandles();

        return (
            <g
                className="layout-cell-selection"
                pointerEvents="none"
            >
                <rect
                    className="layout-cell-selection-border"
                    x={
                        rect.x + 1
                    }
                    y={
                        rect.y + 1
                    }
                    width={
                        Math.max(
                            0,
                            rect.width - 2
                        )
                    }
                    height={
                        Math.max(
                            0,
                            rect.height - 2
                        )
                    }
                />

                <g
                    className="layout-cell-selection-handles"
                    pointerEvents="all"
                >
                    {handles.map(
                        (
                            handle
                        ) => (
                            <circle
                                key={
                                    handle.name
                                }
                                className={
                                    `layout-cell-selection-handle ` +
                                    `layout-cell-selection-handle-${handle.name.toLowerCase()}`
                                }
                                cx={
                                    handle.x
                                }
                                cy={
                                    handle.y
                                }
                                r={
                                    SELECTION_HANDLE_RADIUS
                                }
                                onPointerDown={(
                                    event
                                ) =>
                                    startSelectionHandleDrag(
                                        event,
                                        handle
                                    )
                                }
                                onPointerMove={
                                    handleSelectionPointerMove
                                }
                                onPointerUp={
                                    handleSelectionPointerUp
                                }
                                onPointerCancel={
                                    handleSelectionPointerUp
                                }
                            />
                        )
                    )}
                </g>
            </g>
        );
    }

    /*
     * ---------------------------------------------------------
     * ZEICHEN-/STROKE-FUNKTIONEN
     * ---------------------------------------------------------
     */

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

    /*
     * ---------------------------------------------------------
     * DOPPELKLICK
     * ---------------------------------------------------------
     */

    function handleDoubleClick(
        event
    ) {
        if (!editMode) {
            return;
        }

        /*
         * Auswahlwerkzeug darf keinen
         * Weichen-Dialog öffnen.
         */
        if (
            tool === Tool.NONE
        ) {
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

    /*
     * ---------------------------------------------------------
     * POINTER DOWN
     * ---------------------------------------------------------
     */

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
         * AUSWAHLWERKZEUG
         * ==========================
         *
         * Tool.NONE ist das
         * Auswahlwerkzeug.
         */

        if (
            tool === Tool.NONE
        ) {
            createSingleCellSelection(
                cell
            );

            return;
        }

        /*
         * ==========================
         * NORMALE ELEMENT-WERKZEUGE
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

    /*
     * ---------------------------------------------------------
     * POINTER MOVE
     * ---------------------------------------------------------
     */

    function handlePointerMove(
        event
    ) {
        if (!editMode) {
            return;
        }

        /*
         * Auswahl-Griff bewegen.
         */
        if (
            selectionDragRef.current
                .active
        ) {
            updateSelectionFromHandle(
                event
            );

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

    /*
     * ---------------------------------------------------------
     * POINTER UP
     * ---------------------------------------------------------
     */

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
        if (
            selectionDragRef.current
                .active
        ) {
            finishSelectionHandleDrag(
                event
            );

            return;
        }

        finishPointerStroke(
            event
        );
    }

    function handlePointerCancel(
        event
    ) {
        if (
            selectionDragRef.current
                .active
        ) {
            finishSelectionHandleDrag(
                event
            );

            return;
        }

        finishPointerStroke(
            event
        );
    }

    /*
     * ---------------------------------------------------------
     * VORSCHAU
     * ---------------------------------------------------------
     */

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

    /*
     * ---------------------------------------------------------
     * RENDER
     * ---------------------------------------------------------
     */

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

                {renderSelection()}
            </svg>
        </div>
    );
}
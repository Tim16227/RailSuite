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
const HANDLE_RADIUS = 4;

export function LayoutGrid({
    layout,
    tool,
    editMode,
    onStrokeComplete,
    onCellAction,
    onCellProperties,
    onMoveSelection,
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

    const [
        selectedRange,
        setSelectedRange,
    ] = useState(null);

    const [
        movePreview,
        setMovePreview,
    ] = useState(null);

    const pointerStateRef =
        useRef({
            active: false,
            pointerId: null,
            points: [],
            lastCell: null,
            startPixel: null,
        });

    const selectionDragRef =
        useRef({
            active: false,
            pointerId: null,
            handle: null,
            anchor: null,
        });

    const moveDragRef =
        useRef({
            active: false,
            pointerId: null,
            startCell: null,
            lastDeltaX: 0,
            lastDeltaY: 0,
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

        if (
            cell.digitalSystem ==
                null ||
            cell.digitalAddress ==
                null
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

    function normalizeRange(
        range
    ) {
        return {
            minX: Math.min(
                range.minX,
                range.maxX
            ),

            minY: Math.min(
                range.minY,
                range.maxY
            ),

            maxX: Math.max(
                range.minX,
                range.maxX
            ),

            maxY: Math.max(
                range.minY,
                range.maxY
            ),
        };
    }

    function selectCell(
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

    function isCellSelected(
        cell
    ) {
        if (!selectedRange) {
            return false;
        }

        const range =
            normalizeRange(
                selectedRange
            );

        return (
            cell.x >= range.minX &&
            cell.x <= range.maxX &&
            cell.y >= range.minY &&
            cell.y <= range.maxY
        );
    }

    function getSelectionRect() {
        if (!selectedRange) {
            return null;
        }

        const range =
            normalizeRange(
                selectedRange
            );

        return {
            x:
                range.minX *
                CELL_SIZE,

            y:
                range.minY *
                CELL_SIZE,

            width:
                (
                    range.maxX -
                    range.minX +
                    1
                ) *
                CELL_SIZE,

            height:
                (
                    range.maxY -
                    range.minY +
                    1
                ) *
                CELL_SIZE,
        };
    }

    function getSelectionHandles() {
        const rect =
            getSelectionRect();

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
                id: "TOP_LEFT",
                x: left,
                y: top,
            },
            {
                id: "TOP",
                x: centerX,
                y: top,
            },
            {
                id: "TOP_RIGHT",
                x: right,
                y: top,
            },
            {
                id: "RIGHT",
                x: right,
                y: centerY,
            },
            {
                id: "BOTTOM_RIGHT",
                x: right,
                y: bottom,
            },
            {
                id: "BOTTOM",
                x: centerX,
                y: bottom,
            },
            {
                id: "BOTTOM_LEFT",
                x: left,
                y: bottom,
            },
            {
                id: "LEFT",
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
            tool !== null ||
            !selectedRange
        ) {
            return;
        }

        event.preventDefault();
        event.stopPropagation();

        const range =
            normalizeRange(
                selectedRange
            );

        let anchor;

        switch (handle.id) {
            case "TOP_LEFT":
                anchor = {
                    x: range.maxX,
                    y: range.maxY,
                };
                break;

            case "TOP":
                anchor = {
                    x: null,
                    y: range.maxY,
                };
                break;

            case "TOP_RIGHT":
                anchor = {
                    x: range.minX,
                    y: range.maxY,
                };
                break;

            case "RIGHT":
                anchor = {
                    x: range.minX,
                    y: null,
                };
                break;

            case "BOTTOM_RIGHT":
                anchor = {
                    x: range.minX,
                    y: range.minY,
                };
                break;

            case "BOTTOM":
                anchor = {
                    x: null,
                    y: range.minY,
                };
                break;

            case "BOTTOM_LEFT":
                anchor = {
                    x: range.maxX,
                    y: range.minY,
                };
                break;

            case "LEFT":
                anchor = {
                    x: range.maxX,
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
                handle.id,
            anchor,
        };

        event.currentTarget.setPointerCapture(
            event.pointerId
        );
    }

    function updateSelectionHandle(
        event
    ) {
        const drag =
            selectionDragRef.current;

        if (
            !drag.active ||
            drag.pointerId !==
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
            drag.anchor;

        let minX;
        let maxX;
        let minY;
        let maxY;

        switch (drag.handle) {
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

        setSelectedRange({
            minX: Math.max(
                0,
                Math.min(
                    layout.width - 1,
                    minX
                )
            ),
            minY: Math.max(
                0,
                Math.min(
                    layout.height - 1,
                    minY
                )
            ),
            maxX: Math.max(
                0,
                Math.min(
                    layout.width - 1,
                    maxX
                )
            ),
            maxY: Math.max(
                0,
                Math.min(
                    layout.height - 1,
                    maxY
                )
            ),
        });
    }

    function finishSelectionHandleDrag(
        event
    ) {
        const drag =
            selectionDragRef.current;

        if (
            !drag.active ||
            drag.pointerId !==
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

    /*
     * ---------------------------------------------------------
     * VERSCHIEBEN
     * ---------------------------------------------------------
     */

    function startMove(
        event,
        cell
    ) {
        if (
            tool !== Tool.MOVE ||
            !selectedRange ||
            !isCellSelected(cell)
        ) {
            return false;
        }

        event.preventDefault();
        event.stopPropagation();

        moveDragRef.current = {
            active: true,
            pointerId:
                event.pointerId,
            startCell: cell,
            lastDeltaX: 0,
            lastDeltaY: 0,
        };

        setMovePreview({
            deltaX: 0,
            deltaY: 0,
        });

        event.currentTarget.setPointerCapture(
            event.pointerId
        );

        return true;
    }

    function updateMove(
        event
    ) {
        const drag =
            moveDragRef.current;

        if (
            !drag.active ||
            drag.pointerId !==
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

        const deltaX =
            cell.x -
            drag.startCell.x;

        const deltaY =
            cell.y -
            drag.startCell.y;

        const range =
            normalizeRange(
                selectedRange
            );

        const maxDeltaX =
            layout.width -
            1 -
            range.maxX;

        const minDeltaX =
            -range.minX;

        const maxDeltaY =
            layout.height -
            1 -
            range.maxY;

        const minDeltaY =
            -range.minY;

        const boundedDeltaX =
            Math.max(
                minDeltaX,
                Math.min(
                    maxDeltaX,
                    deltaX
                )
            );

        const boundedDeltaY =
            Math.max(
                minDeltaY,
                Math.min(
                    maxDeltaY,
                    deltaY
                )
            );

        drag.lastDeltaX =
            boundedDeltaX;

        drag.lastDeltaY =
            boundedDeltaY;

        setMovePreview({
            deltaX:
                boundedDeltaX,
            deltaY:
                boundedDeltaY,
        });
    }

    async function finishMove(
        event
    ) {
        const drag =
            moveDragRef.current;

        if (
            !drag.active ||
            drag.pointerId !==
                event.pointerId
        ) {
            return;
        }

        moveDragRef.current = {
            active: false,
            pointerId: null,
            startCell: null,
            lastDeltaX: 0,
            lastDeltaY: 0,
        };

        const deltaX =
            drag.lastDeltaX;

        const deltaY =
            drag.lastDeltaY;

        setMovePreview(
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
            deltaX === 0 &&
            deltaY === 0
        ) {
            return;
        }

        const range =
            normalizeRange(
                selectedRange
            );

        if (
            onMoveSelection
        ) {
            await onMoveSelection(
                range,
                deltaX,
                deltaY
            );
        }

        setSelectedRange({
            minX:
                range.minX +
                deltaX,

            minY:
                range.minY +
                deltaY,

            maxX:
                range.maxX +
                deltaX,

            maxY:
                range.maxY +
                deltaY,
        });
    }

    /*
     * ---------------------------------------------------------
     * STROKE
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

        const distance =
            Math.max(
                Math.abs(dx),
                Math.abs(dy)
            );

        if (
            distance === 0
        ) {
            return [
                start,
            ];
        }

        const cells = [];

        for (
            let index = 0;
            index <= distance;
            index++
        ) {
            const progress =
                index /
                distance;

            cells.push({
                x: Math.round(
                    start.x +
                        dx *
                            progress
                ),

                y: Math.round(
                    start.y +
                        dy *
                            progress
                ),
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
                    result.length - 1
                ];

            if (
                !last ||
                last.x !== cell.x ||
                last.y !== cell.y
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
                last.x === cell.x &&
                last.y === cell.y
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

        const end =
            getSnappedPreviewEnd(
                state.startPixel,
                currentPixel
            );

        setPreviewLine({
            start:
                state.startPixel,
            end,
        });
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
         * Betriebsmodus:
         * ausschließlich Weichen.
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
         * Eigenschaften.
         */
        if (
            tool === Tool.PROPERTIES
        ) {
            if (
                onCellProperties
            ) {
                onCellProperties(
                    layoutCell
                );
            }

            return;
        }

        /*
         * Verschieben.
         */
        if (
            tool === Tool.MOVE
        ) {
            startMove(
                event,
                cell
            );

            return;
        }

        /*
         * Kein Werkzeug:
         * Zelle auswählen.
         */
        if (
            tool === null
        ) {
            selectCell(
                cell
            );

            return;
        }

        /*
         * Manuelle Elementwerkzeuge.
         */
        if (
            tool !== Tool.PEN &&
            tool !== Tool.ERASER
        ) {
            if (
                onCellAction
            ) {
                onCellAction(
                    cell
                );
            }

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

        if (
            selectionDragRef.current
                .active
        ) {
            updateSelectionHandle(
                event
            );

            return;
        }

        if (
            moveDragRef.current
                .active
        ) {
            updateMove(
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
            lastCell.x === cell.x &&
            lastCell.y === cell.y
        ) {
            return;
        }

        addCellsToStroke(
            getCellsBetween(
                lastCell,
                cell
            )
        );

        state.lastCell =
            cell;
    }

    /*
     * ---------------------------------------------------------
     * POINTER UP
     * ---------------------------------------------------------
     */

    async function handlePointerUp(
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

        if (
            moveDragRef.current
                .active
        ) {
            await finishMove(
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
            points.length > 0 &&
            editMode
        ) {
            onStrokeComplete(
                points
            );
        }
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

        if (
            moveDragRef.current
                .active
        ) {
            moveDragRef.current = {
                active: false,
                pointerId: null,
                startCell: null,
                lastDeltaX: 0,
                lastDeltaY: 0,
            };

            setMovePreview(
                null
            );

            return;
        }

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
    }

    /*
     * ---------------------------------------------------------
     * AUSWAHL RENDERN
     * ---------------------------------------------------------
     */

    function renderSelection() {
        if (
            !editMode ||
            !selectedRange
        ) {
            return null;
        }

        const rect =
            getSelectionRect();

        if (!rect) {
            return null;
        }

        const isMoving =
            tool === Tool.MOVE &&
            movePreview != null;

        const offsetX =
            isMoving
                ? movePreview.deltaX *
                  CELL_SIZE
                : 0;

        const offsetY =
            isMoving
                ? movePreview.deltaY *
                  CELL_SIZE
                : 0;

        const handles =
            getSelectionHandles();

        return (
            <g
                className="layout-cell-selection"
                transform={
                    `translate(${offsetX} ${offsetY})`
                }
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

                {!isMoving &&
                    tool === null && (
                        <g>
                            {handles.map(
                                (
                                    handle
                                ) => (
                                    <circle
                                        key={
                                            handle.id
                                        }
                                        className={
                                            `layout-cell-selection-handle ` +
                                            `layout-cell-selection-handle-${handle.id.toLowerCase()}`
                                        }
                                        cx={
                                            handle.x
                                        }
                                        cy={
                                            handle.y
                                        }
                                        r={
                                            HANDLE_RADIUS
                                        }
                                        pointerEvents="all"
                                        onPointerDown={(
                                            event
                                        ) =>
                                            startSelectionHandleDrag(
                                                event,
                                                handle
                                            )
                                        }
                                        onPointerMove={
                                            updateSelectionHandle
                                        }
                                        onPointerUp={
                                            finishSelectionHandleDrag
                                        }
                                        onPointerCancel={
                                            finishSelectionHandleDrag
                                        }
                                    />
                                )
                            )}
                        </g>
                    )}
            </g>
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
                        previewLine.start.x
                    }
                    y1={
                        previewLine.start.y
                    }
                    x2={
                        previewLine.end.x
                    }
                    y2={
                        previewLine.end.y
                    }
                />

                <circle
                    className="layout-track-preview-point"
                    cx={
                        previewLine.start.x
                    }
                    cy={
                        previewLine.start.y
                    }
                    r="4"
                />

                <circle
                    className="layout-track-preview-point"
                    cx={
                        previewLine.end.x
                    }
                    cy={
                        previewLine.end.y
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
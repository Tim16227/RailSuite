import {
    useEffect,
    useRef,
    useState,
} from "react";

import {
    createPortal,
} from "react-dom";

import {
    Tool,
} from "../../models/layout";

import {
    deleteLayoutCell,
    setLayoutCell,
} from "../../api/layoutApi";

import "../../styles/layout-selection.css";

const CELL_SIZE = 40;

const HANDLE_SIZE = 8;

const HANDLE_MARGIN = 2;

function containsCell(
    range,
    cell
) {
    if (
        !range ||
        !cell
    ) {
        return false;
    }

    return (
        cell.x >= range.minX &&
        cell.x <= range.maxX &&
        cell.y >= range.minY &&
        cell.y <= range.maxY
    );
}

function getRangeFromHandle(
    range,
    handle,
    cell
) {
    let minX =
        range.minX;

    let maxX =
        range.maxX;

    let minY =
        range.minY;

    let maxY =
        range.maxY;

    if (
        handle.includes("w")
    ) {
        minX =
            Math.min(
                cell.x,
                maxX
            );
    }

    if (
        handle.includes("e")
    ) {
        maxX =
            Math.max(
                cell.x,
                minX
            );
    }

    if (
        handle.includes("n")
    ) {
        minY =
            Math.min(
                cell.y,
                maxY
            );
    }

    if (
        handle.includes("s")
    ) {
        maxY =
            Math.max(
                cell.y,
                minY
            );
    }

    /*
     * Wenn ein Griff über die
     * gegenüberliegende Seite gezogen
     * wird, wird die Auswahl weiterhin
     * als gültiges Rechteck gehalten.
     */
    if (
        handle.includes("w") &&
        cell.x > range.maxX
    ) {
        minX =
            range.maxX;
        maxX =
            cell.x;
    }

    if (
        handle.includes("e") &&
        cell.x < range.minX
    ) {
        minX =
            cell.x;
        maxX =
            range.minX;
    }

    if (
        handle.includes("n") &&
        cell.y > range.maxY
    ) {
        minY =
            range.maxY;
        maxY =
            cell.y;
    }

    if (
        handle.includes("s") &&
        cell.y < range.minY
    ) {
        minY =
            cell.y;
        maxY =
            range.minY;
    }

    return {
        minX,
        minY,
        maxX,
        maxY,
    };
}

function rangeWidth(
    range
) {
    return (
        range.maxX -
        range.minX +
        1
    );
}

function rangeHeight(
    range
) {
    return (
        range.maxY -
        range.minY +
        1
    );
}

export function LayoutSelectionOverlay({
    layout,
    tool,
    editMode,
    onLayoutChanged,
}) {
    const [
        portalTarget,
        setPortalTarget,
    ] = useState(null);

    const [
        selection,
        setSelection,
    ] = useState(null);

    const [
        previewSelection,
        setPreviewSelection,
    ] = useState(null);

    const pointerRef =
        useRef(null);

    useEffect(() => {
        if (!layout) {
            return;
        }

        let frame;

        function attach() {
            const grid =
                document.querySelector(
                    ".layout-grid"
                );

            if (!grid) {
                frame =
                    requestAnimationFrame(
                        attach
                    );

                return;
            }

            setPortalTarget(
                grid
            );
        }

        frame =
            requestAnimationFrame(
                attach
            );

        return () => {
            cancelAnimationFrame(
                frame
            );
        };
    }, [
        layout?.id,
        layout?.width,
        layout?.height,
    ]);

    useEffect(() => {
        if (
            !editMode ||
            tool !== Tool.MOVE
        ) {
            pointerRef.current =
                null;

            setPreviewSelection(
                null
            );
        }
    }, [
        editMode,
        tool,
    ]);

    if (
        !portalTarget ||
        !layout ||
        !editMode ||
        tool !== Tool.MOVE
    ) {
        return null;
    }

    const width =
        layout.width *
        CELL_SIZE;

    const height =
        layout.height *
        CELL_SIZE;

    function getCellFromPointer(
        event
    ) {
        const rect =
            event.currentTarget.getBoundingClientRect();

        const x =
            Math.max(
                0,
                Math.min(
                    layout.width - 1,
                    Math.floor(
                        (
                            event.clientX -
                            rect.left
                        ) /
                            CELL_SIZE
                    )
                )
            );

        const y =
            Math.max(
                0,
                Math.min(
                    layout.height - 1,
                    Math.floor(
                        (
                            event.clientY -
                            rect.top
                        ) /
                            CELL_SIZE
                    )
                )
            );

        return {
            x,
            y,
        };
    }

    function getHandle(
        target
    ) {
        if (
            !target ||
            !target.dataset
        ) {
            return null;
        }

        return (
            target.dataset
                .selectionHandle ??
            null
        );
    }

    function startMove(
        event,
        cell,
        range
    ) {
        pointerRef.current = {
            type: "move",

            startCell: cell,

            originalSelection:
                range,

            deltaX: 0,
            deltaY: 0,

            pointerId:
                event.pointerId,
        };

        event.currentTarget.setPointerCapture(
            event.pointerId
        );
    }

    function handlePointerDown(
        event
    ) {
        event.preventDefault();
        event.stopPropagation();

        const cell =
            getCellFromPointer(
                event
            );

        const handle =
            getHandle(
                event.target
            );

        /*
         * Die acht Punkte dienen ausschließlich
         * zum Verändern der Auswahl.
         */
        if (
            selection &&
            handle
        ) {
            pointerRef.current = {
                type: "resize",

                handle,

                pointerId:
                    event.pointerId,
            };

            event.currentTarget.setPointerCapture(
                event.pointerId
            );

            return;
        }

        /*
         * Jeder normale Klick markiert
         * genau die angeklickte Zelle.
         *
         * Danach beginnt sofort der
         * Verschiebevorgang.
         */
        let range;

        if (
            selection &&
            containsCell(
                selection,
                cell
            )
        ) {
            range =
                selection;
        } else {
            range = {
                minX: cell.x,
                maxX: cell.x,
                minY: cell.y,
                maxY: cell.y,
            };

            setSelection(
                range
            );
        }

        startMove(
            event,
            cell,
            range
        );
    }

    function handlePointerMove(
        event
    ) {
        const state =
            pointerRef.current;

        if (
            !state ||
            state.pointerId !==
                event.pointerId
        ) {
            return;
        }

        const cell =
            getCellFromPointer(
                event
            );

        if (
            state.type ===
            "resize"
        ) {
            if (!selection) {
                return;
            }

            const resized =
                getRangeFromHandle(
                    selection,
                    state.handle,
                    cell
                );

            setSelection(
                resized
            );

            return;
        }

        if (
            state.type !==
            "move"
        ) {
            return;
        }

        const deltaX =
            cell.x -
            state.startCell.x;

        const deltaY =
            cell.y -
            state.startCell.y;

        state.deltaX =
            deltaX;

        state.deltaY =
            deltaY;

        setPreviewSelection({
            minX:
                state
                    .originalSelection
                    .minX +
                deltaX,

            maxX:
                state
                    .originalSelection
                    .maxX +
                deltaX,

            minY:
                state
                    .originalSelection
                    .minY +
                deltaY,

            maxY:
                state
                    .originalSelection
                    .maxY +
                deltaY,
        });
    }

    async function moveSelection(
        range,
        deltaX,
        deltaY
    ) {
        if (
            !range ||
            (
                deltaX === 0 &&
                deltaY === 0
            )
        ) {
            return false;
        }

        const targetMinX =
            range.minX +
            deltaX;

        const targetMaxX =
            range.maxX +
            deltaX;

        const targetMinY =
            range.minY +
            deltaY;

        const targetMaxY =
            range.maxY +
            deltaY;

        /*
         * Auswahl darf das Layout
         * nicht verlassen.
         */
        if (
            targetMinX < 0 ||
            targetMinY < 0 ||
            targetMaxX >=
                layout.width ||
            targetMaxY >=
                layout.height
        ) {
            return false;
        }

        const selectedCells =
            layout.cells.filter(
                (cell) =>
                    cell.x >=
                        range.minX &&
                    cell.x <=
                        range.maxX &&
                    cell.y >=
                        range.minY &&
                    cell.y <=
                        range.maxY
            );

        /*
         * Leere Auswahl kann nicht
         * verschoben werden.
         */
        if (
            selectedCells.length ===
            0
        ) {
            return false;
        }

        const selectedKeys =
            new Set(
                selectedCells.map(
                    (cell) =>
                        `${cell.x}:${cell.y}`
                )
            );

        /*
         * Keine Zelle darf beim Verschieben
         * eine fremde Zelle überschreiben.
         */
        for (
            const cell of
                selectedCells
        ) {
            const targetX =
                cell.x +
                deltaX;

            const targetY =
                cell.y +
                deltaY;

            const collision =
                layout.cells.find(
                    (other) =>
                        !selectedKeys.has(
                            `${other.x}:${other.y}`
                        ) &&
                        other.x ===
                            targetX &&
                        other.y ===
                            targetY
                );

            if (collision) {
                return false;
            }
        }

        /*
         * Originalzellen löschen.
         */
        for (
            const cell of
                selectedCells
        ) {
            await deleteLayoutCell(
                layout.id,
                cell.x,
                cell.y
            );
        }

        /*
         * Zellen an den neuen Positionen
         * wieder anlegen.
         */
        const movedCells =
            [];

        for (
            const cell of
                selectedCells
        ) {
            const moved =
                await setLayoutCell(
                    layout.id,
                    cell.x +
                        deltaX,
                    cell.y +
                        deltaY,
                    cell.elementType,
                    cell.orientation,
                    cell.turnoutHand,
                    cell.digitalSystem
                        ?.id ??
                        null,
                    cell.digitalAddress ??
                        null
                );

            movedCells.push(
                moved
            );
        }

        if (
            onLayoutChanged
        ) {
            const deletedKeys =
                new Set(
                    selectedCells.map(
                        (cell) =>
                            `${cell.x}:${cell.y}`
                    )
                );

            const remaining =
                layout.cells.filter(
                    (cell) =>
                        !deletedKeys.has(
                            `${cell.x}:${cell.y}`
                        )
                );

            onLayoutChanged({
                ...layout,

                cells: [
                    ...remaining,
                    ...movedCells,
                ],
            });
        }

        return true;
    }

    async function handlePointerUp(
        event
    ) {
        const state =
            pointerRef.current;

        if (
            !state ||
            state.pointerId !==
                event.pointerId
        ) {
            return;
        }

        pointerRef.current =
            null;

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
            state.type ===
            "resize"
        ) {
            return;
        }

        if (
            state.type !==
            "move"
        ) {
            return;
        }

        const deltaX =
            state.deltaX ?? 0;

        const deltaY =
            state.deltaY ?? 0;

        const originalSelection =
            state.originalSelection;

        setPreviewSelection(
            null
        );

        if (
            deltaX === 0 &&
            deltaY === 0
        ) {
            return;
        }

        try {
            const moved =
                await moveSelection(
                    originalSelection,
                    deltaX,
                    deltaY
                );

            if (moved) {
                setSelection({
                    minX:
                        originalSelection.minX +
                        deltaX,

                    maxX:
                        originalSelection.maxX +
                        deltaX,

                    minY:
                        originalSelection.minY +
                        deltaY,

                    maxY:
                        originalSelection.maxY +
                        deltaY,
                });
            }
        } catch (exception) {
            console.error(
                "Fehler beim Verschieben:",
                exception
            );
        }
    }

    function handlePointerCancel(
        event
    ) {
        const state =
            pointerRef.current;

        if (
            !state ||
            state.pointerId !==
                event.pointerId
        ) {
            return;
        }

        pointerRef.current =
            null;

        setPreviewSelection(
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
    }

    function renderRange(
        range,
        className
    ) {
        if (!range) {
            return null;
        }

        return (
            <rect
                className={
                    className
                }
                x={
                    range.minX *
                        CELL_SIZE +
                    1
                }
                y={
                    range.minY *
                        CELL_SIZE +
                    1
                }
                width={
                    rangeWidth(
                        range
                    ) *
                        CELL_SIZE -
                    2
                }
                height={
                    rangeHeight(
                        range
                    ) *
                        CELL_SIZE -
                    2
                }
            />
        );
    }

    function renderHandle(
        name,
        x,
        y,
        cursor
    ) {
        return (
            <rect
                key={name}
                className="layout-selection-handle"
                data-selection-handle={
                    name
                }
                x={
                    x -
                    HANDLE_SIZE / 2
                }
                y={
                    y -
                    HANDLE_SIZE / 2
                }
                width={
                    HANDLE_SIZE
                }
                height={
                    HANDLE_SIZE
                }
                style={{
                    cursor,
                }}
            />
        );
    }

    function renderHandles(
        range
    ) {
        if (!range) {
            return null;
        }

        const left =
            range.minX *
                CELL_SIZE +
            HANDLE_MARGIN;

        const right =
            (
                range.maxX + 1
            ) *
                CELL_SIZE -
            HANDLE_MARGIN;

        const top =
            range.minY *
                CELL_SIZE +
            HANDLE_MARGIN;

        const bottom =
            (
                range.maxY + 1
            ) *
                CELL_SIZE -
            HANDLE_MARGIN;

        const centerX =
            (
                left +
                right
            ) / 2;

        const centerY =
            (
                top +
                bottom
            ) / 2;

        return (
            <>
                {renderHandle(
                    "nw",
                    left,
                    top,
                    "nwse-resize"
                )}

                {renderHandle(
                    "n",
                    centerX,
                    top,
                    "ns-resize"
                )}

                {renderHandle(
                    "ne",
                    right,
                    top,
                    "nesw-resize"
                )}

                {renderHandle(
                    "e",
                    right,
                    centerY,
                    "ew-resize"
                )}

                {renderHandle(
                    "se",
                    right,
                    bottom,
                    "nwse-resize"
                )}

                {renderHandle(
                    "s",
                    centerX,
                    bottom,
                    "ns-resize"
                )}

                {renderHandle(
                    "sw",
                    left,
                    bottom,
                    "nesw-resize"
                )}

                {renderHandle(
                    "w",
                    left,
                    centerY,
                    "ew-resize"
                )}
            </>
        );
    }

    return createPortal(
        <div className="layout-selection-overlay">
            <svg
                className="layout-selection-layer"
                width={width}
                height={height}
                viewBox={
                    `0 0 ${width} ${height}`
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
                {previewSelection &&
                    renderRange(
                        previewSelection,
                        "layout-selection-preview"
                    )}

                {selection &&
                    renderRange(
                        selection,
                        "layout-selection-rect"
                    )}

                {selection &&
                    renderHandles(
                        selection
                    )}
            </svg>
        </div>,
        portalTarget
    );
}
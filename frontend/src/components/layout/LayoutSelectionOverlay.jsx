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

import "../../styles/layout-selection.css";

const CELL_SIZE = 40;

const HANDLE_SIZE = 8;

const HANDLE_MARGIN = 2;

function normalizeRange(
    start,
    end
) {
    return {
        minX: Math.min(
            start.x,
            end.x
        ),
        minY: Math.min(
            start.y,
            end.y
        ),
        maxX: Math.max(
            start.x,
            end.x
        ),
        maxY: Math.max(
            start.y,
            end.y
        ),
    };
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

function containsCell(
    range,
    cell
) {
    if (!range || !cell) {
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
    let minX = range.minX;
    let maxX = range.maxX;
    let minY = range.minY;
    let maxY = range.maxY;

    if (
        handle.includes("w")
    ) {
        minX = cell.x;
    }

    if (
        handle.includes("e")
    ) {
        maxX = cell.x;
    }

    if (
        handle.includes("n")
    ) {
        minY = cell.y;
    }

    if (
        handle.includes("s")
    ) {
        maxY = cell.y;
    }

    /*
     * Verhindert, dass ein Ziehgriff
     * über den gegenüberliegenden
     * Rand hinausläuft.
     */
    if (minX > maxX) {
        if (handle.includes("w")) {
            minX = maxX;
        } else {
            maxX = minX;
        }
    }

    if (minY > maxY) {
        if (handle.includes("n")) {
            minY = maxY;
        } else {
            maxY = minY;
        }
    }

    return {
        minX,
        minY,
        maxX,
        maxY,
    };
}

export function LayoutSelectionOverlay({
    layout,
    tool,
    editMode,
    onMoveSelection,
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
    ]);

    useEffect(() => {
        if (
            !editMode ||
            (
                tool !== null &&
                tool !== Tool.MOVE
            )
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
        !editMode
    ) {
        return null;
    }

    /*
     * Das Overlay ist nur aktiv, wenn
     * entweder kein Werkzeug ausgewählt
     * oder das Verschieben-Werkzeug
     * aktiv ist.
     */
    const active =
        tool === null ||
        tool === Tool.MOVE;

    if (!active) {
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
            clamp(
                Math.floor(
                    (
                        event.clientX -
                        rect.left
                    ) /
                        CELL_SIZE
                ),
                0,
                layout.width - 1
            );

        const y =
            clamp(
                Math.floor(
                    (
                        event.clientY -
                        rect.top
                    ) /
                        CELL_SIZE
                ),
                0,
                layout.height - 1
            );

        return {
            x,
            y,
        };
    }

    function getPointerPixel(
        event
    ) {
        const rect =
            event.currentTarget.getBoundingClientRect();

        return {
            x:
                event.clientX -
                rect.left,

            y:
                event.clientY -
                rect.top,
        };
    }

    function getHandleFromTarget(
        target
    ) {
        if (
            !target ||
            !target.dataset
        ) {
            return null;
        }

        return (
            target.dataset.selectionHandle ??
            null
        );
    }

    function handlePointerDown(
        event
    ) {
        if (!active) {
            return;
        }

        event.preventDefault();
        event.stopPropagation();

        const cell =
            getCellFromPointer(
                event
            );

        const handle =
            getHandleFromTarget(
                event.target
            );

        /*
         * Bereich vergrößern/verkleinern.
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
         * Verschieben:
         *
         * Wenn das Verschieben-Werkzeug
         * aktiv ist und innerhalb der
         * aktuellen Auswahl geklickt wird,
         * beginnt der Verschiebevorgang.
         */
        if (
            tool === Tool.MOVE &&
            selection &&
            containsCell(
                selection,
                cell
            )
        ) {
            pointerRef.current = {
                type: "move",
                startCell: cell,
                originalSelection:
                    selection,
                lastDeltaX: 0,
                lastDeltaY: 0,
                pointerId:
                    event.pointerId,
            };

            event.currentTarget.setPointerCapture(
                event.pointerId
            );

            return;
        }

        /*
         * Neue Auswahl beginnen.
         */
        pointerRef.current = {
            type: "select",
            startCell: cell,
            pointerId:
                event.pointerId,
        };

        setSelection(
            normalizeRange(
                cell,
                cell
            )
        );

        event.currentTarget.setPointerCapture(
            event.pointerId
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
            "select"
        ) {
            const nextSelection =
                normalizeRange(
                    state.startCell,
                    cell
                );

            setSelection(
                nextSelection
            );

            return;
        }

        if (
            state.type ===
            "resize"
        ) {
            const nextSelection =
                getRangeFromHandle(
                    selection,
                    state.handle,
                    cell
                );

            setSelection(
                nextSelection
            );

            return;
        }

        if (
            state.type ===
            "move"
        ) {
            const deltaX =
                cell.x -
                state.startCell.x;

            const deltaY =
                cell.y -
                state.startCell.y;

            state.lastDeltaX =
                deltaX;

            state.lastDeltaY =
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
            "move"
        ) {
            const {
                lastDeltaX,
                lastDeltaY,
                originalSelection,
            } = state;

            setPreviewSelection(
                null
            );

            if (
                lastDeltaX === 0 &&
                lastDeltaY === 0
            ) {
                return;
            }

            try {
                const moved =
                    await onMoveSelection(
                        originalSelection,
                        lastDeltaX,
                        lastDeltaY
                    );

                if (moved) {
                    setSelection({
                        minX:
                            originalSelection.minX +
                            lastDeltaX,

                        maxX:
                            originalSelection.maxX +
                            lastDeltaX,

                        minY:
                            originalSelection.minY +
                            lastDeltaY,

                        maxY:
                            originalSelection.maxY +
                            lastDeltaY,
                    });
                }
            } catch (error) {
                console.error(
                    "Fehler beim Verschieben der Auswahl:",
                    error
                );
            }

            return;
        }

        /*
         * Beim einfachen Klicken bleibt
         * die einzelne Zelle als Auswahl
         * bestehen.
         */
        if (
            state.type ===
            "select"
        ) {
            const cell =
                getCellFromPointer(
                    event
                );

            setSelection(
                normalizeRange(
                    state.startCell,
                    cell
                )
            );
        }

        if (
            state.type ===
            "resize"
        ) {
            setSelection(
                selection
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

    function renderSelection(
        range,
        className
    ) {
        if (!range) {
            return null;
        }

        const x =
            range.minX *
            CELL_SIZE;

        const y =
            range.minY *
            CELL_SIZE;

        const selectionWidth =
            (
                range.maxX -
                range.minX +
                1
            ) *
            CELL_SIZE;

        const selectionHeight =
            (
                range.maxY -
                range.minY +
                1
            ) *
            CELL_SIZE;

        return (
            <rect
                className={
                    className
                }
                x={x + 1}
                y={y + 1}
                width={
                    selectionWidth -
                    2
                }
                height={
                    selectionHeight -
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
                    HANDLE_SIZE /
                        2
                }
                y={
                    y -
                    HANDLE_SIZE /
                        2
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
                    void handlePointerUp
                }
                onPointerCancel={
                    handlePointerCancel
                }
            >
                {previewSelection &&
                    renderSelection(
                        previewSelection,
                        "layout-selection-preview"
                    )}

                {selection &&
                    renderSelection(
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
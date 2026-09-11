import {
    useEffect,
    useState,
} from "react";

import {
    createPortal,
} from "react-dom";

import {
    Tool,
} from "../../models/layout";

import {
    getBlocks,
    updateBlock,
} from "../../api/blockApi";

import "../../styles/properties-editor.css";

const CELL_SIZE = 40;

export function PropertiesEditor({
    layout,
    tool,
    editMode,
}) {
    const [
        portalTarget,
        setPortalTarget,
    ] = useState(null);

    const [
        blocks,
        setBlocks,
    ] = useState([]);

    const [
        selectedBlockId,
        setSelectedBlockId,
    ] = useState(null);

    const [
        form,
        setForm,
    ] = useState({
        name: "",
        lengthMm: "",
        direction: "BOTH",
    });

    useEffect(() => {
        if (!layout?.id) {
            return;
        }

        let active = true;

        async function load() {
            try {
                const result =
                    await getBlocks(
                        layout.id
                    );

                if (!active) {
                    return;
                }

                setBlocks(
                    result
                );
            } catch (error) {
                console.error(
                    "Blockeigenschaften konnten nicht geladen werden:",
                    error
                );
            }
        }

        load();

        return () => {
            active = false;
        };
    }, [layout?.id]);

    useEffect(() => {
        if (!layout?.id) {
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
    }, [layout?.id]);

    useEffect(() => {
        const block =
            blocks.find(
                (item) =>
                    item.id ===
                    selectedBlockId
            );

        if (!block) {
            return;
        }

        setForm({
            name:
                block.name ?? "",

            lengthMm:
                String(
                    block.lengthMm ??
                        ""
                ),

            direction:
                block.direction ??
                "BOTH",
        });
    }, [
        selectedBlockId,
        blocks,
    ]);

    if (
        !portalTarget ||
        !layout
    ) {
        return null;
    }

    const interactive =
        editMode &&
        tool === Tool.PROPERTIES;

    function getCellFromEvent(
        event
    ) {
        const rect =
            event.currentTarget
                .getBoundingClientRect();

        const x =
            Math.floor(
                (
                    event.clientX -
                    rect.left
                ) /
                    CELL_SIZE
            );

        const y =
            Math.floor(
                (
                    event.clientY -
                    rect.top
                ) /
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

    function findBlockAtCell(
        cell
    ) {
        if (!cell) {
            return null;
        }

        return (
            blocks.find(
                (block) =>
                    block.cells?.some(
                        (blockCell) =>
                            blockCell.x ===
                                cell.x &&
                            blockCell.y ===
                                cell.y
                    )
            ) ?? null
        );
    }

    function handleOverlayClick(
        event
    ) {
        if (!interactive) {
            return;
        }

        const cell =
            getCellFromEvent(
                event
            );

        const block =
            findBlockAtCell(
                cell
            );

        if (!block) {
            setSelectedBlockId(
                null
            );

            return;
        }

        setSelectedBlockId(
            block.id
        );
    }

    async function saveBlock() {
        const block =
            blocks.find(
                (item) =>
                    item.id ===
                    selectedBlockId
            );

        if (!block) {
            return;
        }

        try {
            const updated =
                await updateBlock(
                    layout.id,
                    block.id,
                    {
                        name:
                            form.name.trim() ||
                            block.name,

                        lengthMm:
                            Number(
                                form.lengthMm
                            ),

                        direction:
                            form.direction,

                        cells:
                            block.cells.map(
                                (
                                    cell
                                ) => ({
                                    x:
                                        cell.x,
                                    y:
                                        cell.y,
                                    sequenceIndex:
                                        cell.sequenceIndex,
                                })
                            ),
                    }
                );

            setBlocks(
                (current) =>
                    current.map(
                        (item) =>
                            item.id ===
                            updated.id
                                ? updated
                                : item
                    )
            );
        } catch (error) {
            console.error(
                "Blockeigenschaften konnten nicht gespeichert werden:",
                error
            );
        }
    }

    function renderBlock(
        block
    ) {
        const active =
            block.id ===
            selectedBlockId;

        return (
            <g
                key={block.id}
                className={
                    active
                        ? "properties-block active"
                        : "properties-block"
                }
                pointerEvents="none"
            >
                {block.cells.map(
                    (cell) => (
                        <rect
                            key={
                                `${block.id}-${cell.x}-${cell.y}`
                            }
                            x={
                                cell.x *
                                    CELL_SIZE +
                                3
                            }
                            y={
                                cell.y *
                                    CELL_SIZE +
                                3
                            }
                            width={
                                CELL_SIZE -
                                6
                            }
                            height={
                                CELL_SIZE -
                                6
                            }
                            rx="5"
                        />
                    )
                )}
            </g>
        );
    }

    const selectedBlock =
        blocks.find(
            (block) =>
                block.id ===
                selectedBlockId
        ) ?? null;

    return createPortal(
        <div
            className={
                interactive
                    ? "properties-editor-overlay interactive"
                    : "properties-editor-overlay"
            }
        >
            {interactive && (
                <svg
                    className="properties-editor-hit-layer"
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
                    onClick={
                        handleOverlayClick
                    }
                >
                    {blocks.map(
                        renderBlock
                    )}
                </svg>
            )}

            {interactive && (
                <div className="properties-editor-panel">
                    <div className="properties-editor-header">
                        <strong>
                            Eigenschaften
                        </strong>
                    </div>

                    {!selectedBlock && (
                        <div className="properties-editor-empty">
                            Klicke auf ein Element,
                            um dessen Eigenschaften
                            zu öffnen.
                        </div>
                    )}

                    {selectedBlock && (
                        <>
                            <div className="properties-editor-section">
                                <h4>
                                    Block
                                </h4>

                                <label>
                                    Name

                                    <input
                                        value={
                                            form.name
                                        }
                                        onChange={(
                                            event
                                        ) =>
                                            setForm(
                                                (
                                                    current
                                                ) => ({
                                                    ...current,
                                                    name:
                                                        event
                                                            .target
                                                            .value,
                                                })
                                            )
                                        }
                                    />
                                </label>

                                <label>
                                    Länge (mm)

                                    <input
                                        type="number"
                                        min="1"
                                        value={
                                            form.lengthMm
                                        }
                                        onChange={(
                                            event
                                        ) =>
                                            setForm(
                                                (
                                                    current
                                                ) => ({
                                                    ...current,
                                                    lengthMm:
                                                        event
                                                            .target
                                                            .value,
                                                })
                                            )
                                        }
                                    />
                                </label>

                                <label>
                                    Richtung

                                    <select
                                        value={
                                            form.direction
                                        }
                                        onChange={(
                                            event
                                        ) =>
                                            setForm(
                                                (
                                                    current
                                                ) => ({
                                                    ...current,
                                                    direction:
                                                        event
                                                            .target
                                                            .value,
                                                })
                                            )
                                        }
                                    >
                                        <option value="BOTH">
                                            Beide Richtungen
                                        </option>

                                        <option value="FORWARD">
                                            Vorwärts
                                        </option>

                                        <option value="REVERSE">
                                            Rückwärts
                                        </option>
                                    </select>
                                </label>

                                <div className="properties-editor-info">
                                    <span>
                                        Zellen
                                    </span>

                                    <strong>
                                        {
                                            selectedBlock
                                                .cells
                                                ?.length ??
                                            0
                                        }
                                    </strong>
                                </div>

                                <button
                                    type="button"
                                    className="properties-editor-save"
                                    onClick={() =>
                                        void saveBlock()
                                    }
                                >
                                    Eigenschaften speichern
                                </button>
                            </div>
                        </>
                    )}
                </div>
            )}
        </div>,
        portalTarget
    );
}
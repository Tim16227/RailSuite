import {
    useEffect,
    useState,
} from "react";

import {
    createPortal,
} from "react-dom";

import {
    LayoutElementType,
    Tool,
} from "../../models/layout";

import {
    getBlocks,
} from "../../api/blockApi";

import useDialogs from "../dialog/utils/useDialogs";

import "../../styles/properties-editor.css";

const CELL_SIZE = 40;

export function PropertiesEditor({
    layout,
    tool,
    editMode,
    onLayoutCellUpdated,
}) {
    const [
        portalTarget,
        setPortalTarget,
    ] = useState(null);

    const [
        blocks,
        setBlocks,
    ] = useState([]);

    const {
        open,
    } = useDialogs();

    useEffect(() => {
        if (!layout?.id) {
            return;
        }

        let active = true;

        async function loadBlocks() {
            try {
                const result =
                    await getBlocks(
                        layout.id
                    );

                if (!active) {
                    return;
                }

                setBlocks(
                    result ?? []
                );
            } catch (exception) {
                console.error(
                    "Blöcke konnten nicht geladen werden:",
                    exception
                );
            }
        }

        loadBlocks();

        return () => {
            active = false;
        };
    }, [
        layout?.id,
    ]);

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
    }, [
        layout?.id,
    ]);

    if (
        !portalTarget ||
        !layout ||
        !editMode ||
        tool !== Tool.PROPERTIES
    ) {
        return null;
    }

    function getCellFromEvent(
        event
    ) {
        const rect =
            event.currentTarget.getBoundingClientRect();

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

    function findLayoutCell(
        cell
    ) {
        if (!cell) {
            return null;
        }

        return (
            layout.cells.find(
                (layoutCell) =>
                    layoutCell.x ===
                        cell.x &&
                    layoutCell.y ===
                        cell.y
            ) ?? null
        );
    }

    function handleClick(
        event
    ) {
        event.preventDefault();
        event.stopPropagation();

        const cell =
            getCellFromEvent(
                event
            );

        if (!cell) {
            return;
        }

        /*
         * Block zuerst prüfen.
         *
         * Ein Block hat bei einem Klick
         * Vorrang vor einer darunterliegenden
         * Gleiszelle.
         */
        const block =
            findBlockAtCell(
                cell
            );

        if (block) {
            open(
                "layout-block",
                {
                    layoutId:
                        layout.id,

                    block,

                    onSaved:
                        handleBlockSaved,
                }
            );

            return;
        }

        const layoutCell =
            findLayoutCell(
                cell
            );

        if (
            layoutCell?.elementType !==
            LayoutElementType.TURNOUT
        ) {
            return;
        }

        open(
            "layout-turnout",
            {
                layoutId:
                    layout.id,

                cell:
                    layoutCell,

                onSaved:
                    handleTurnoutSaved,
            }
        );
    }

    function handleTurnoutSaved(
        updatedCell
    ) {
        if (
            onLayoutCellUpdated
        ) {
            onLayoutCellUpdated(
                updatedCell
            );
        }
    }

    function handleBlockSaved(
        updatedBlock
    ) {
        if (!updatedBlock) {
            return;
        }

        setBlocks(
            (current) =>
                current.map(
                    (block) =>
                        block.id ===
                        updatedBlock.id
                            ? updatedBlock
                            : block
                )
        );
    }

    return createPortal(
        <div className="properties-editor-overlay interactive">
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
                    handleClick
                }
            />
        </div>,
        portalTarget
    );
}
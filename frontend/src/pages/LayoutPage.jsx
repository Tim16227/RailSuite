import {
    useEffect,
    useState,
} from "react";

import {
    createLayout,
    getLayouts,
} from "../api/layoutApi";

import {
    LayoutEditor,
} from "../components/layout/LayoutEditor";

import {
    BlockEditor,
} from "../components/layout/BlockEditor";

import {
    LayoutSelectionOverlay,
} from "../components/layout/LayoutSelectionOverlay";

import {
    PropertiesEditor,
} from "../components/layout/PropertiesEditor";

export default function LayoutPage({
    tool,
    setTool,
    editMode,
}) {
    const [
        layout,
        setLayout,
    ] = useState(null);

    const [
        layoutRevision,
        setLayoutRevision,
    ] = useState(0);

    const [
        loading,
        setLoading,
    ] = useState(true);

    const [
        error,
        setError,
    ] = useState(null);

    useEffect(() => {
        loadLayout();
    }, []);

    async function loadLayout() {
        try {
            setLoading(true);
            setError(null);

            const layouts =
                await getLayouts();

            if (
                layouts.length > 0
            ) {
                setLayout(
                    layouts[0]
                );

                return;
            }

            const newLayout =
                await createLayout({
                    name:
                        "Mein Gleisplan",

                    width: 30,
                    height: 20,
                });

            setLayout(
                newLayout
            );
        } catch (exception) {
            console.error(
                exception
            );

            setError(
                "Das Layout konnte nicht geladen werden."
            );
        } finally {
            setLoading(false);
        }
    }

    function handleLayoutChanged(
        updatedLayout
    ) {
        setLayout(
            updatedLayout
        );

        /*
         * LayoutEditor besitzt intern
         * seinen eigenen Layout-State.
         *
         * Durch die neue Revision wird
         * er nach einer Verschiebung
         * sauber neu aufgebaut.
         */
        setLayoutRevision(
            (current) =>
                current + 1
        );
    }

    function handleLayoutCellUpdated(
        updatedCell
    ) {
        if (!updatedCell) {
            return;
        }

        setLayout(
            (current) => {
                if (!current) {
                    return current;
                }

                const cells =
                    current.cells.filter(
                        (cell) =>
                            cell.x !==
                                updatedCell.x ||
                            cell.y !==
                                updatedCell.y
                    );

                return {
                    ...current,
                    cells: [
                        ...cells,
                        updatedCell,
                    ],
                };
            }
        );

        /*
         * Der LayoutEditor soll die
         * geänderte Weiche ebenfalls
         * sofort aus seinem lokalen
         * State übernehmen.
         */
        setLayoutRevision(
            (current) =>
                current + 1
        );
    }

    if (loading) {
        return (
            <div>
                Layout wird geladen...
            </div>
        );
    }

    if (error) {
        return (
            <div>
                {error}
            </div>
        );
    }

    if (!layout) {
        return (
            <div>
                Kein Layout vorhanden.
            </div>
        );
    }

    return (
        <>
            <LayoutEditor
                key={
                    `layout-editor-${layoutRevision}`
                }
                initialLayout={
                    layout
                }
                tool={tool}
                setTool={
                    setTool
                }
                editMode={
                    editMode
                }
            />

            <BlockEditor
                key={
                    `block-editor-${layoutRevision}`
                }
                layout={layout}
                tool={tool}
                editMode={
                    editMode
                }
            />

            <LayoutSelectionOverlay
                layout={layout}
                tool={tool}
                editMode={
                    editMode
                }
                onLayoutChanged={
                    handleLayoutChanged
                }
            />

            <PropertiesEditor
                layout={layout}
                tool={tool}
                editMode={
                    editMode
                }
                onLayoutCellUpdated={
                    handleLayoutCellUpdated
                }
            />
        </>
    );
}
import {
    useEffect,
    useState,
} from "react";

import Dialog from "../../dialog/Dialog/Dialog";

import {
    getBlockEditor,
    updateBlockEditor,
} from "../../../api/blockEditorApi";

import {
    BlockDirection,
    BlockGridOrientation,
} from "../../../models/block";

import BlockEditorTab from "./BlockEditorTab";

import "./BlockPropertiesDialog.css";

export default function BlockPropertiesDialog({
    layoutId,
    block,
    onClose,
    onSaved,
}) {
    const [
        activeTab,
        setActiveTab,
    ] = useState(
        "GENERAL"
    );

    const [
        data,
        setData,
    ] = useState(null);

    const [
        name,
        setName,
    ] = useState(
        block?.name ?? ""
    );

    const [
        lengthMm,
        setLengthMm,
    ] = useState(
        String(
            block?.lengthMm ?? ""
        )
    );

    const [
        direction,
        setDirection,
    ] = useState(
        block?.direction ??
            BlockDirection.BOTH
    );

    const [
        showSignals,
        setShowSignals,
    ] = useState(true);

    const [
        visibleOnlyInEditMode,
        setVisibleOnlyInEditMode,
    ] = useState(false);

    const [
        requestYellow,
        setRequestYellow,
    ] = useState(false);

    const [
        maximumSpeedKmh,
        setMaximumSpeedKmh,
    ] = useState("");

    const [
        slowSpeedKmh,
        setSlowSpeedKmh,
    ] = useState("");

    const [
        includeInTrainTracking,
        setIncludeInTrainTracking,
    ] = useState(true);

    const [
        maximumTrainLengthMm,
        setMaximumTrainLengthMm,
    ] = useState("");

    const [
        loading,
        setLoading,
    ] = useState(true);

    const [
        saving,
        setSaving,
    ] = useState(false);

    const [
        error,
        setError,
    ] = useState(null);

    useEffect(() => {
        if (
            !layoutId ||
            !block?.id
        ) {
            return;
        }

        let active = true;

        async function load() {
            try {
                setLoading(true);
                setError(null);

                const current =
                    await getBlockEditor(
                        layoutId,
                        block.id
                    );

                if (!active) {
                    return;
                }

                setData(
                    current
                );

                setName(
                    current.name ??
                        ""
                );

                setLengthMm(
                    String(
                        current.lengthMm ??
                            ""
                    )
                );

                setDirection(
                    current.direction ??
                        BlockDirection.BOTH
                );

                setShowSignals(
                    current.showSignals ??
                        true
                );

                setVisibleOnlyInEditMode(
                    current.visibleOnlyInEditMode ??
                        false
                );

                setRequestYellow(
                    current.requestYellow ??
                        false
                );

                setMaximumSpeedKmh(
                    current.maximumSpeedKmh ??
                        ""
                );

                setSlowSpeedKmh(
                    current.slowSpeedKmh ??
                        ""
                );

                setIncludeInTrainTracking(
                    current.includeInTrainTracking ??
                        true
                );

                setMaximumTrainLengthMm(
                    current.maximumTrainLengthMm ??
                        ""
                );
            } catch (exception) {
                console.error(
                    "Blockdaten konnten nicht geladen werden:",
                    exception
                );

                if (active) {
                    setError(
                        "Die aktuellen Blockdaten konnten nicht geladen werden."
                    );
                }
            } finally {
                if (active) {
                    setLoading(false);
                }
            }
        }

        load();

        return () => {
            active = false;
        };
    }, [
        layoutId,
        block?.id,
    ]);

    function clearError() {
        if (error) {
            setError(
                null
            );
        }
    }

    function handleEditorDataChanged(
        updated
    ) {
        setData(
            updated
        );
    }

    async function handleSubmit(
        event
    ) {
        event.preventDefault();

        if (
            saving ||
            !data
        ) {
            return;
        }

        const trimmedName =
            name.trim();

        const numericLength =
            Number(
                lengthMm
            );

        const numericMaximumSpeed =
            maximumSpeedKmh ===
            ""
                ? null
                : Number(
                      maximumSpeedKmh
                  );

        const numericSlowSpeed =
            slowSpeedKmh ===
            ""
                ? null
                : Number(
                      slowSpeedKmh
                  );

        const numericTrainLength =
            maximumTrainLengthMm ===
            ""
                ? null
                : Number(
                      maximumTrainLengthMm
                  );

        if (!trimmedName) {
            setError(
                "Bitte einen Blocknamen eingeben."
            );
            return;
        }

        if (
            !Number.isFinite(
                numericLength
            ) ||
            numericLength <= 0
        ) {
            setError(
                "Bitte eine gültige Blocklänge eingeben."
            );
            return;
        }

        if (
            numericMaximumSpeed !==
                null &&
            (
                !Number.isFinite(
                    numericMaximumSpeed
                ) ||
                numericMaximumSpeed <
                    0
            )
        ) {
            setError(
                "Bitte eine gültige Maximalgeschwindigkeit eingeben."
            );
            return;
        }

        if (
            numericSlowSpeed !==
                null &&
            (
                !Number.isFinite(
                    numericSlowSpeed
                ) ||
                numericSlowSpeed <
                    0
            )
        ) {
            setError(
                "Bitte eine gültige Langsamgeschwindigkeit eingeben."
            );
            return;
        }

        if (
            numericTrainLength !==
                null &&
            (
                !Number.isFinite(
                    numericTrainLength
                ) ||
                numericTrainLength <
                    0
            )
        ) {
            setError(
                "Bitte eine gültige maximale Zuglänge eingeben."
            );
            return;
        }

        try {
            setSaving(
                true
            );
            setError(
                null
            );

            const updated =
                await updateBlockEditor(
                    layoutId,
                    block.id,
                    {
                        name:
                            trimmedName,
                        lengthMm:
                            numericLength,
                        direction,
                        showSignals,
                        visibleOnlyInEditMode,
                        requestYellow,
                        maximumSpeedKmh:
                            numericMaximumSpeed,
                        slowSpeedKmh:
                            numericSlowSpeed,
                        includeInTrainTracking,
                        maximumTrainLengthMm:
                            numericTrainLength,
                        gridOrientation:
                            data.gridOrientation ??
                            BlockGridOrientation.HORIZONTAL,
                    }
                );

            setData(
                updated
            );

            if (onSaved) {
                onSaved(
                    updated
                );
            }

            onClose();
        } catch (exception) {
            console.error(
                "Block konnte nicht gespeichert werden:",
                exception
            );

            setError(
                "Die Blockeigenschaften konnten nicht gespeichert werden."
            );
        } finally {
            setSaving(
                false
            );
        }
    }

    if (loading) {
        return (
            <Dialog
                title="Block bearbeiten"
                onClose={
                    onClose
                }
                onSubmit={(
                    event
                ) =>
                    event.preventDefault()
                }
                submitLabel="Speichern"
            >
                <div className="block-properties-dialog-loading">
                    Blockdaten werden geladen...
                </div>
            </Dialog>
        );
    }

    return (
        <Dialog
            title="Block bearbeiten"
            onClose={
                onClose
            }
            onSubmit={
                handleSubmit
            }
            submitLabel={
                saving
                    ? "Speichern..."
                    : "Speichern"
            }
        >
            <div className="block-properties-dialog">
                <div className="block-properties-tabs">
                    <button
                        type="button"
                        className={
                            activeTab ===
                            "GENERAL"
                                ? "active"
                                : ""
                        }
                        onClick={() =>
                            setActiveTab(
                                "GENERAL"
                            )
                        }
                    >
                        Allgemeines
                    </button>

                    <button
                        type="button"
                        className={
                            activeTab ===
                            "EDITOR"
                                ? "active"
                                : ""
                        }
                        onClick={() =>
                            setActiveTab(
                                "EDITOR"
                            )
                        }
                    >
                        Blockeditor
                    </button>
                </div>

                {activeTab ===
                    "GENERAL" && (
                    <div className="block-properties-general">
                        <section className="block-properties-section">
                            <h4>
                                Blockeigenschaften
                            </h4>

                            <label>
                                Name
                                <input
                                    type="text"
                                    value={
                                        name
                                    }
                                    onChange={(
                                        event
                                    ) => {
                                        setName(
                                            event
                                                .target
                                                .value
                                        );
                                        clearError();
                                    }}
                                    disabled={
                                        saving
                                    }
                                    autoFocus
                                />
                            </label>

                            <div className="block-properties-inline">
                                <label className="block-properties-checkbox">
                                    <input
                                        type="checkbox"
                                        checked={
                                            showSignals
                                        }
                                        onChange={(
                                            event
                                        ) =>
                                            setShowSignals(
                                                event
                                                    .target
                                                    .checked
                                            )
                                        }
                                        disabled={
                                            saving
                                        }
                                    />
                                    Blocksignale anzeigen
                                </label>

                                <label className="block-properties-checkbox">
                                    <input
                                        type="checkbox"
                                        checked={
                                            visibleOnlyInEditMode
                                        }
                                        onChange={(
                                            event
                                        ) =>
                                            setVisibleOnlyInEditMode(
                                                event
                                                    .target
                                                    .checked
                                            )
                                        }
                                        disabled={
                                            saving
                                        }
                                    />
                                    Sichtbar nur im Editiermodus
                                </label>
                            </div>
                        </section>

                        <section className="block-properties-section">
                            <h4>
                                Signal und Geschwindigkeit
                            </h4>

                            <label className="block-properties-checkbox">
                                <input
                                    type="checkbox"
                                    checked={
                                        requestYellow
                                    }
                                    onChange={(
                                        event
                                    ) =>
                                        setRequestYellow(
                                            event
                                                .target
                                                .checked
                                        )
                                    }
                                    disabled={
                                        saving
                                    }
                                />
                                Gelb anfordern
                            </label>

                            <div className="block-properties-inline">
                                <label>
                                    Maximum
                                    <div className="block-properties-unit-input">
                                        <input
                                            type="number"
                                            min="0"
                                            value={
                                                maximumSpeedKmh
                                            }
                                            onChange={(
                                                event
                                            ) =>
                                                setMaximumSpeedKmh(
                                                    event
                                                        .target
                                                        .value
                                                )
                                            }
                                            disabled={
                                                saving
                                            }
                                        />
                                        <span>
                                            km/h
                                        </span>
                                    </div>
                                </label>

                                <label>
                                    Langsam
                                    <div className="block-properties-unit-input">
                                        <input
                                            type="number"
                                            min="0"
                                            value={
                                                slowSpeedKmh
                                            }
                                            onChange={(
                                                event
                                            ) =>
                                                setSlowSpeedKmh(
                                                    event
                                                        .target
                                                        .value
                                                )
                                            }
                                            disabled={
                                                saving
                                            }
                                        />
                                        <span>
                                            km/h
                                        </span>
                                    </div>
                                </label>
                            </div>
                        </section>

                        <section className="block-properties-section">
                            <h4>
                                Verwendung
                            </h4>

                            <div className="block-properties-inline">
                                <label className="block-properties-checkbox">
                                    <input
                                        type="checkbox"
                                        checked={
                                            direction ===
                                                BlockDirection.BOTH ||
                                            direction ===
                                                BlockDirection.FORWARD
                                        }
                                        onChange={(
                                            event
                                        ) => {
                                            const right =
                                                direction ===
                                                BlockDirection.BOTH ||
                                                direction ===
                                                BlockDirection.REVERSE;

                                            if (
                                                event
                                                    .target
                                                    .checked
                                            ) {
                                                setDirection(
                                                    right
                                                        ? BlockDirection.BOTH
                                                        : BlockDirection.FORWARD
                                                );
                                            } else {
                                                setDirection(
                                                    BlockDirection.REVERSE
                                                );
                                            }
                                        }}
                                        disabled={
                                            saving
                                        }
                                    />
                                    ← Richtung
                                </label>

                                <label className="block-properties-checkbox">
                                    <input
                                        type="checkbox"
                                        checked={
                                            direction ===
                                                BlockDirection.BOTH ||
                                            direction ===
                                                BlockDirection.REVERSE
                                        }
                                        onChange={(
                                            event
                                        ) => {
                                            const left =
                                                direction ===
                                                BlockDirection.BOTH ||
                                                direction ===
                                                BlockDirection.FORWARD;

                                            if (
                                                event
                                                    .target
                                                    .checked
                                            ) {
                                                setDirection(
                                                    left
                                                        ? BlockDirection.BOTH
                                                        : BlockDirection.REVERSE
                                                );
                                            } else {
                                                setDirection(
                                                    BlockDirection.FORWARD
                                                );
                                            }
                                        }}
                                        disabled={
                                            saving
                                        }
                                    />
                                    → Richtung
                                </label>
                            </div>
                        </section>

                        <section className="block-properties-section">
                            <h4>
                                Zugverfolgung
                            </h4>

                            <label className="block-properties-checkbox">
                                <input
                                    type="checkbox"
                                    checked={
                                        includeInTrainTracking
                                    }
                                    onChange={(
                                        event
                                    ) =>
                                        setIncludeInTrainTracking(
                                            event
                                                .target
                                                .checked
                                        )
                                    }
                                    disabled={
                                        saving
                                    }
                                />
                                Block in Zugverfolgung einbeziehen
                            </label>
                        </section>

                        <section className="block-properties-section">
                            <h4>
                                Zuglänge
                            </h4>

                            <label>
                                Maximum
                                <div className="block-properties-unit-input">
                                    <input
                                        type="number"
                                        min="0"
                                        value={
                                            maximumTrainLengthMm
                                        }
                                        onChange={(
                                            event
                                        ) =>
                                            setMaximumTrainLengthMm(
                                                event
                                                    .target
                                                    .value
                                            )
                                        }
                                        disabled={
                                            saving
                                        }
                                    />
                                    <span>
                                        mm
                                    </span>
                                </div>
                            </label>
                        </section>
                    </div>
                )}

                {activeTab ===
                    "EDITOR" &&
                    data && (
                        <BlockEditorTab
                            layoutId={
                                layoutId
                            }
                            blockId={
                                block.id
                            }
                            data={
                                data
                            }
                            onDataChanged={
                                handleEditorDataChanged
                            }
                        />
                    )}

                {error && (
                    <div className="block-properties-dialog-error">
                        {error}
                    </div>
                )}
            </div>
        </Dialog>
    );
}
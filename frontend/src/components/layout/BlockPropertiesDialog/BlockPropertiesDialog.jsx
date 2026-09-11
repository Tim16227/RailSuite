import {
    useEffect,
    useState,
} from "react";

import Dialog from "../../dialog/Dialog/Dialog";

import {
    updateBlock,
} from "../../../api/blockApi";

import "./BlockPropertiesDialog.css";

export default function BlockPropertiesDialog({
    layoutId,
    block,
    onClose,
    onSaved,
}) {
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
            "BOTH"
    );

    const [
        saving,
        setSaving,
    ] = useState(false);

    const [
        error,
        setError,
    ] = useState(null);

    useEffect(() => {
        setName(
            block?.name ?? ""
        );

        setLengthMm(
            String(
                block?.lengthMm ??
                    ""
            )
        );

        setDirection(
            block?.direction ??
                "BOTH"
        );

        setError(null);
    }, [
        block,
    ]);

    async function handleSubmit(
        event
    ) {
        event.preventDefault();

        if (
            saving ||
            !block
        ) {
            return;
        }

        const trimmedName =
            name.trim();

        const numericLength =
            Number(
                lengthMm
            );

        if (
            !trimmedName
        ) {
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
                "Bitte eine gültige Länge größer als 0 eingeben."
            );

            return;
        }

        try {
            setSaving(true);
            setError(null);

            const updated =
                await updateBlock(
                    layoutId,
                    block.id,
                    {
                        name:
                            trimmedName,

                        lengthMm:
                            numericLength,

                        direction,

                        cells:
                            (
                                block.cells ??
                                []
                            ).map(
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

            if (
                onSaved
            ) {
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
            setSaving(false);
        }
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
                <div className="block-properties-dialog-field">
                    <label
                        htmlFor="block-name"
                    >
                        Name
                    </label>

                    <input
                        id="block-name"
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

                            if (error) {
                                setError(
                                    null
                                );
                            }
                        }}
                        disabled={
                            saving
                        }
                        autoFocus
                    />
                </div>

                <div className="block-properties-dialog-field">
                    <label
                        htmlFor="block-length"
                    >
                        Länge (mm)
                    </label>

                    <input
                        id="block-length"
                        type="number"
                        min="1"
                        step="1"
                        value={
                            lengthMm
                        }
                        onChange={(
                            event
                        ) => {
                            setLengthMm(
                                event
                                    .target
                                    .value
                            );

                            if (error) {
                                setError(
                                    null
                                );
                            }
                        }}
                        disabled={
                            saving
                        }
                    />
                </div>

                <div className="block-properties-dialog-field">
                    <label
                        htmlFor="block-direction"
                    >
                        Richtung
                    </label>

                    <select
                        id="block-direction"
                        value={
                            direction
                        }
                        onChange={(
                            event
                        ) => {
                            setDirection(
                                event
                                    .target
                                    .value
                            );
                        }}
                        disabled={
                            saving
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
                </div>

                <div className="block-properties-dialog-info">
                    <span>
                        Zellen
                    </span>

                    <strong>
                        {
                            block?.cells
                                ?.length ??
                            0
                        }
                    </strong>
                </div>

                {error && (
                    <div className="block-properties-dialog-error">
                        {error}
                    </div>
                )}
            </div>
        </Dialog>
    );
}
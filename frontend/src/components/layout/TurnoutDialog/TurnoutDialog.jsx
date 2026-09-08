import {
    useState,
} from "react";

import Dialog from "../../dialog/Dialog/Dialog";

import {
    setLayoutCell,
} from "../../../api/layoutApi";

import "./TurnoutDialog.css";

export default function TurnoutDialog({
    layoutId,
    cell,
    onClose,
    onSaved,
}) {
    const [
        digitalAddress,
        setDigitalAddress,
    ] = useState(
        cell.digitalAddress ?? ""
    );

    const [
        saving,
        setSaving,
    ] = useState(false);

    const [
        error,
        setError,
    ] = useState(null);

    async function handleSubmit(
        event
    ) {
        event.preventDefault();

        if (saving) {
            return;
        }

        const address =
            Number(
                digitalAddress
            );

        if (
            !Number.isInteger(address) ||
            address < 1
        ) {
            setError(
                "Bitte eine gültige Weichenadresse größer als 0 eingeben."
            );
            return;
        }

        try {
            setSaving(true);
            setError(null);

            const digitalSystemId =
                cell.digitalSystem?.id ??
                null;

            const updatedCell =
                await setLayoutCell(
                    layoutId,
                    cell.x,
                    cell.y,
                    cell.elementType,
                    cell.orientation,
                    cell.turnoutHand,
                    digitalSystemId,
                    address
                );

            if (onSaved) {
                onSaved(
                    updatedCell
                );
            }

            onClose();
        } catch (exception) {
            console.error(
                "Fehler beim Speichern der Weichenadresse:",
                exception
            );

            setError(
                "Die Weichenadresse konnte nicht gespeichert werden."
            );
        } finally {
            setSaving(false);
        }
    }

    return (
        <Dialog
            title="Weiche bearbeiten"
            onClose={onClose}
            onSubmit={handleSubmit}
            submitLabel={
                saving
                    ? "Speichern..."
                    : "Speichern"
            }
        >
            <div className="turnout-dialog-field">

                <label
                    htmlFor="turnout-address"
                >
                    Adresse
                </label>

                <input
                    id="turnout-address"
                    type="number"
                    min="1"
                    step="1"
                    value={
                        digitalAddress
                    }
                    onChange={(
                        event
                    ) => {
                        setDigitalAddress(
                            event.target.value
                        );

                        if (error) {
                            setError(null);
                        }
                    }}
                    disabled={saving}
                    autoFocus
                />

                {error && (
                    <div className="turnout-dialog-error">
                        {error}
                    </div>
                )}

            </div>
        </Dialog>
    );
}
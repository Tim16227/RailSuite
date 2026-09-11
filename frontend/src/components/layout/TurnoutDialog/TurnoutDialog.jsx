import {
    useEffect,
    useState,
} from "react";

import Dialog from "../../dialog/Dialog/Dialog";

import {
    setLayoutCell,
} from "../../../api/layoutApi";

import {
    getDigitalSystems,
} from "../../../api/digitalSystemApi";

import "./TurnoutDialog.css";

export default function TurnoutDialog({
    layoutId,
    cell,
    onClose,
    onSaved,
}) {
    const [
        digitalSystemId,
        setDigitalSystemId,
    ] = useState(
        cell.digitalSystem?.id ?? ""
    );

    const [
        digitalAddress,
        setDigitalAddress,
    ] = useState(
        cell.digitalAddress ?? ""
    );

    const [
        digitalSystems,
        setDigitalSystems,
    ] = useState([]);

    const [
        loadingSystems,
        setLoadingSystems,
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
        let cancelled = false;

        async function loadDigitalSystems() {
            try {
                setLoadingSystems(true);
                setError(null);

                const systems =
                    await getDigitalSystems();

                if (!cancelled) {
                    setDigitalSystems(
                        Array.isArray(systems)
                            ? systems
                            : []
                    );
                }
            } catch (exception) {
                console.error(
                    "Fehler beim Laden der Digitalsysteme:",
                    exception
                );

                if (!cancelled) {
                    setError(
                        "Die Digitalsysteme konnten nicht geladen werden."
                    );
                }
            } finally {
                if (!cancelled) {
                    setLoadingSystems(false);
                }
            }
        }

        loadDigitalSystems();

        return () => {
            cancelled = true;
        };
    }, []);

    async function handleSubmit(
        event
    ) {
        event.preventDefault();

        if (saving) {
            return;
        }

        if (!digitalSystemId) {
            setError(
                "Bitte ein Digitalsystem auswählen."
            );
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
                "Fehler beim Speichern der Weichenkonfiguration:",
                exception
            );

            setError(
                "Die Weichenkonfiguration konnte nicht gespeichert werden."
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
                    htmlFor="turnout-system"
                >
                    System
                </label>

                <select
                    id="turnout-system"
                    value={
                        digitalSystemId
                    }
                    onChange={(
                        event
                    ) => {
                        setDigitalSystemId(
                            event.target.value
                        );

                        if (error) {
                            setError(null);
                        }
                    }}
                    disabled={
                        loadingSystems ||
                        saving
                    }
                >
                    <option value="">
                        Bitte System auswählen
                    </option>

                    {digitalSystems.map(
                        (system) => (
                            <option
                                key={system.id}
                                value={system.id}
                            >
                                {system.name}
                                {system.manufacturer
                                    ? ` – ${system.manufacturer}`
                                    : ""}
                                {system.model
                                    ? ` ${system.model}`
                                    : ""}
                            </option>
                        )
                    )}
                </select>

                {loadingSystems && (
                    <div className="turnout-dialog-hint">
                        Digitalsysteme werden geladen...
                    </div>
                )}

                {!loadingSystems &&
                    digitalSystems.length === 0 && (
                        <div className="turnout-dialog-hint">
                            Es sind keine Digitalsysteme hinterlegt.
                        </div>
                    )}
            </div>

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
                />
            </div>

            {error && (
                <div className="turnout-dialog-error">
                    {error}
                </div>
            )}
        </Dialog>
    );
}
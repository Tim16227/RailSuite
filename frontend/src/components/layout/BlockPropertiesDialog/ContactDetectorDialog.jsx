import {
    useEffect,
    useState,
} from "react";

import Dialog from "../../dialog/Dialog/Dialog";

import {
    createContactDetector,
    assignContactDetector,
    updateContactDetector,
} from "../../../api/blockApi";

import {
    updateBlockEditorContact,
} from "../../../api/blockEditorApi";

import {
    ContactDetectorType,
    BlockContactRole,
} from "../../../models/block";

import "./ContactDetectorDialog.css";

export default function ContactDetectorDialog({
    layoutId,
    blockId,
    positionMm,
    type,
    detector,
    assignment,
    digitalSystems = [],
    onClose,
    onSaved,
}) {
    const editing =
        Boolean(detector?.id);

    const [
        name,
        setName,
    ] = useState(
        detector?.name ?? ""
    );

    const [
        detectorType,
        setDetectorType,
    ] = useState(
        detector?.type ??
            type ??
            ContactDetectorType.PHYSICAL
    );

    const [
        digitalSystemId,
        setDigitalSystemId,
    ] = useState(
        detector?.digitalSystemId ??
            ""
    );

    const [
        digitalAddress,
        setDigitalAddress,
    ] = useState(
        detector?.digitalAddress !=
        null
            ? String(
                  detector.digitalAddress
              )
            : ""
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
            detector?.name ?? ""
        );

        setDetectorType(
            detector?.type ??
                type ??
                ContactDetectorType.PHYSICAL
        );

        setDigitalSystemId(
            detector?.digitalSystemId ??
                ""
        );

        setDigitalAddress(
            detector?.digitalAddress !=
            null
                ? String(
                      detector.digitalAddress
                  )
                : ""
        );
    }, [
        detector?.id,
        type,
    ]);

    async function handleSubmit(
        event
    ) {
        event.preventDefault();

        const trimmedName =
            name.trim();

        if (!trimmedName) {
            setError(
                "Bitte einen Namen eingeben."
            );
            return;
        }

        if (
            detectorType ===
            ContactDetectorType.PHYSICAL &&
            !digitalSystemId
        ) {
            setError(
                "Bitte ein Digitalsystem auswählen."
            );
            return;
        }

        let numericAddress =
            null;

        if (
            detectorType ===
            ContactDetectorType.PHYSICAL
        ) {
            numericAddress =
                Number(
                    digitalAddress
                );

            if (
                !Number.isInteger(
                    numericAddress
                ) ||
                numericAddress < 1
            ) {
                setError(
                    "Bitte eine gültige Adresse eingeben."
                );
                return;
            }
        }

        try {
            setSaving(true);
            setError(null);

            let savedDetector;

            if (editing) {
                savedDetector =
                    await updateContactDetector(
                        layoutId,
                        detector.id,
                        {
                            name:
                                trimmedName,
                            type:
                                detectorType,
                            digitalSystemId:
                                detectorType ===
                                ContactDetectorType.PHYSICAL
                                    ? digitalSystemId
                                    : null,
                            digitalAddress:
                                detectorType ===
                                ContactDetectorType.PHYSICAL
                                    ? numericAddress
                                    : null,
                        }
                    );
            } else {
                savedDetector =
                    await createContactDetector(
                        layoutId,
                        {
                            name:
                                trimmedName,
                            type:
                                detectorType,
                            digitalSystemId:
                                detectorType ===
                                ContactDetectorType.PHYSICAL
                                    ? digitalSystemId
                                    : null,
                            digitalAddress:
                                detectorType ===
                                ContactDetectorType.PHYSICAL
                                    ? numericAddress
                                    : null,
                        }
                    );
            }

            let savedAssignment =
                assignment;

            if (!assignment) {
                savedAssignment =
                    await assignContactDetector(
                        layoutId,
                        blockId,
                        {
                            contactDetectorId:
                                savedDetector.id,
                            role:
                                BlockContactRole.OCCUPANCY,
                            positionMm:
                                positionMm ?? 0,
                        }
                    );

                savedAssignment =
                    await updateBlockEditorContact(
                        layoutId,
                        blockId,
                        savedAssignment.id,
                        {
                            positionMm:
                                positionMm ?? 0,
                            lengthMm: 1,
                        }
                    );
            } else {
                savedAssignment = {
                    ...assignment,
                    contactDetectorId:
                        savedDetector.id,
                    contactDetectorName:
                        savedDetector.name,
                    contactDetectorType:
                        savedDetector.type,
                };
            }

            if (onSaved) {
                onSaved({
                    detector:
                        savedDetector,
                    assignment:
                        savedAssignment,
                });
            }

            onClose();
        } catch (exception) {
            console.error(
                "Belegtmelder konnte nicht gespeichert werden:",
                exception
            );

            setError(
                "Der Belegtmelder konnte nicht gespeichert werden."
            );
        } finally {
            setSaving(false);
        }
    }

    return (
        <Dialog
            title={
                editing
                    ? "Belegtmelder bearbeiten"
                    : "Belegtmelder anlegen"
            }
            onClose={onClose}
            onSubmit={
                handleSubmit
            }
            submitLabel={
                saving
                    ? "Speichern..."
                    : "Speichern"
            }
        >
            <div className="contact-detector-dialog">
                <section className="contact-detector-section">
                    <h4>
                        Belegtmelder
                    </h4>

                    <label>
                        Name
                        <input
                            type="text"
                            value={
                                name
                            }
                            disabled={
                                saving
                            }
                            onChange={(
                                event
                            ) =>
                                setName(
                                    event
                                        .target
                                        .value
                                )
                            }
                            autoFocus
                        />
                    </label>

                    <label>
                        Typ
                        <select
                            value={
                                detectorType
                            }
                            disabled={
                                saving
                            }
                            onChange={(
                                event
                            ) => {
                                setDetectorType(
                                    event
                                        .target
                                        .value
                                );

                                if (
                                    event
                                        .target
                                        .value ===
                                    ContactDetectorType.VIRTUAL
                                ) {
                                    setDigitalSystemId(
                                        ""
                                    );
                                    setDigitalAddress(
                                        ""
                                    );
                                }
                            }}
                        >
                            <option
                                value={
                                    ContactDetectorType.PHYSICAL
                                }
                            >
                                Physisch
                            </option>

                            <option
                                value={
                                    ContactDetectorType.VIRTUAL
                                }
                            >
                                Virtuell
                            </option>
                        </select>
                    </label>

                    {detectorType ===
                        ContactDetectorType.PHYSICAL && (
                        <>
                            <label>
                                Digitalsystem
                                <select
                                    value={
                                        digitalSystemId
                                    }
                                    disabled={
                                        saving
                                    }
                                    onChange={(
                                        event
                                    ) =>
                                        setDigitalSystemId(
                                            event
                                                .target
                                                .value
                                        )
                                    }
                                >
                                    <option value="">
                                        Bitte wählen
                                    </option>

                                    {digitalSystems.map(
                                        (
                                            system
                                        ) => (
                                            <option
                                                key={
                                                    system.id
                                                }
                                                value={
                                                    system.id
                                                }
                                            >
                                                {
                                                    system.name
                                                }
                                            </option>
                                        )
                                    )}
                                </select>
                            </label>

                            <label>
                                Adresse
                                <input
                                    type="number"
                                    min="1"
                                    value={
                                        digitalAddress
                                    }
                                    disabled={
                                        saving
                                    }
                                    onChange={(
                                        event
                                    ) =>
                                        setDigitalAddress(
                                            event
                                                .target
                                                .value
                                        )
                                    }
                                />
                            </label>
                        </>
                    )}
                </section>

                <section className="contact-detector-section">
                    <h4>
                        Belegtmeldeabschnitt
                    </h4>

                    <div className="contact-detector-info">
                        <span>
                            Position
                        </span>

                        <strong>
                            {assignment
                                ?.positionMm ??
                                positionMm ??
                                0}{" "}
                            mm
                        </strong>
                    </div>

                    <div className="contact-detector-info">
                        <span>
                            Rolle
                        </span>

                        <strong>
                            Belegtmelder
                        </strong>
                    </div>
                </section>

                {error && (
                    <div className="contact-detector-error">
                        {error}
                    </div>
                )}
            </div>
        </Dialog>
    );
}
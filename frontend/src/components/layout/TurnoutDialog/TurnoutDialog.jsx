import {
    useState,
} from "react";

import Dialog from "../../dialog/Dialog/Dialog";

import {
    LayoutOrientation,
    LayoutTurnoutHand,
} from "../../../models/layout";

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
        turnoutHand,
        setTurnoutHand,
    ] = useState(
        cell.turnoutHand ??
        LayoutTurnoutHand.LEFT
    );

    const [
        orientation,
        setOrientation,
    ] = useState(
        cell.orientation ??
        LayoutOrientation.EAST
    );

    const [
        saving,
        setSaving,
    ] = useState(false);

    async function handleSubmit(
        event
    ) {
        event.preventDefault();

        if (saving) {
            return;
        }

        try {
            setSaving(true);

            const updatedCell =
                await setLayoutCell(
                    layoutId,
                    cell.x,
                    cell.y,
                    cell.elementType,
                    orientation,
                    turnoutHand
                );

            if (onSaved) {
                onSaved(
                    updatedCell
                );
            }

            onClose();
        } catch (error) {
            console.error(
                "Fehler beim Speichern der Weiche:",
                error
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
                <label>
                    Weichentyp
                </label>

                <div className="turnout-dialog-radio-group">
                    <label>
                        <input
                            type="radio"
                            name="turnout-hand"
                            value={
                                LayoutTurnoutHand.LEFT
                            }
                            checked={
                                turnoutHand ===
                                LayoutTurnoutHand.LEFT
                            }
                            onChange={() =>
                                setTurnoutHand(
                                    LayoutTurnoutHand.LEFT
                                )
                            }
                        />

                        Links
                    </label>

                    <label>
                        <input
                            type="radio"
                            name="turnout-hand"
                            value={
                                LayoutTurnoutHand.RIGHT
                            }
                            checked={
                                turnoutHand ===
                                LayoutTurnoutHand.RIGHT
                            }
                            onChange={() =>
                                setTurnoutHand(
                                    LayoutTurnoutHand.RIGHT
                                )
                            }
                        />

                        Rechts
                    </label>
                </div>
            </div>

            <div className="turnout-dialog-field">
                <label htmlFor="turnout-orientation">
                    Ausrichtung
                </label>

                <select
                    id="turnout-orientation"
                    value={orientation}
                    onChange={(event) =>
                        setOrientation(
                            event.target.value
                        )
                    }
                >
                    <option
                        value={
                            LayoutOrientation.NORTH
                        }
                    >
                        Norden
                    </option>

                    <option
                        value={
                            LayoutOrientation.NORTH_EAST
                        }
                    >
                        Nordost
                    </option>

                    <option
                        value={
                            LayoutOrientation.EAST
                        }
                    >
                        Osten
                    </option>

                    <option
                        value={
                            LayoutOrientation.SOUTH_EAST
                        }
                    >
                        Südost
                    </option>

                    <option
                        value={
                            LayoutOrientation.SOUTH
                        }
                    >
                        Süden
                    </option>

                    <option
                        value={
                            LayoutOrientation.SOUTH_WEST
                        }
                    >
                        Südwest
                    </option>

                    <option
                        value={
                            LayoutOrientation.WEST
                        }
                    >
                        Westen
                    </option>

                    <option
                        value={
                            LayoutOrientation.NORTH_WEST
                        }
                    >
                        Nordwest
                    </option>
                </select>
            </div>
        </Dialog>
    );
}

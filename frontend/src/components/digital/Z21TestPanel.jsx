import {
    useEffect,
    useState,
} from "react";

import {
    getLayouts,
    setLayoutTurnout,
} from "../../api/layoutApi";

import "./Z21TestPanel.css";

export default function Z21TestPanel() {
    const [
        layouts,
        setLayouts,
    ] = useState([]);

    const [
        selectedLayout,
        setSelectedLayout,
    ] = useState(null);

    const [
        firstTurnout,
        setFirstTurnout,
    ] = useState(null);

    const [
        loading,
        setLoading,
    ] = useState(true);

    const [
        testing,
        setTesting,
    ] = useState(false);

    const [
        status,
        setStatus,
    ] = useState(null);

    useEffect(() => {
        loadFirstTurnout();
    }, []);

    async function loadFirstTurnout() {
        setLoading(true);
        setStatus(null);

        try {
            const result = await getLayouts();

            const availableLayouts =
                Array.isArray(result)
                    ? result
                    : [];

            setLayouts(availableLayouts);

            if (availableLayouts.length === 0) {
                setSelectedLayout(null);
                setFirstTurnout(null);

                setStatus({
                    type: "error",
                    message:
                        "Es ist kein Layout vorhanden.",
                });

                return;
            }

            const layout =
                availableLayouts[0];

            setSelectedLayout(layout);

            const turnout =
                Array.isArray(layout.cells)
                    ? layout.cells.find(
                        (cell) =>
                            cell.elementType ===
                            "TURNOUT"
                    )
                    : null;

            setFirstTurnout(turnout || null);

            if (!turnout) {
                setStatus({
                    type: "error",
                    message:
                        "Im ersten Layout wurde keine Weiche gefunden.",
                });
            }
        } catch (error) {
            console.error(
                "Could not load layouts:",
                error
            );

            setStatus({
                type: "error",
                message:
                    error.message ||
                    "Das Layout konnte nicht geladen werden.",
            });
        } finally {
            setLoading(false);
        }
    }

    async function handleTest(state) {
        if (!selectedLayout) {
            setStatus({
                type: "error",
                message:
                    "Kein Layout ausgewählt.",
            });

            return;
        }

        if (!firstTurnout) {
            setStatus({
                type: "error",
                message:
                    "Keine Weiche im Layout gefunden.",
            });

            return;
        }

        setTesting(true);
        setStatus(null);

        try {
            await setLayoutTurnout(
                selectedLayout.id,
                firstTurnout.x,
                firstTurnout.y,
                state
            );

            setStatus({
                type: "success",
                message:
                    `Weiche bei (${firstTurnout.x}, ${firstTurnout.y}) wurde auf ${state === "LEFT"
                        ? "Links"
                        : "Rechts"
                    } gestellt.`,
            });
        } catch (error) {
            console.error(
                "Turnout test failed:",
                error
            );

            setStatus({
                type: "error",
                message:
                    error.message ||
                    "Der Weichenbefehl konnte nicht gesendet werden.",
            });
        } finally {
            setTesting(false);
        }
    }

    return (
        <main className="z21-test-page">
            <section className="z21-test-panel">
                <div className="z21-test-panel__header">
                    <div>
                        <h1>
                            Z21 Test
                        </h1>

                        <p>
                            Teste die erste im Layout
                            vorhandene Weiche über
                            das angeschlossene
                            Digitalsystem.
                        </p>
                    </div>
                </div>

                {loading ? (
                    <div className="z21-test-panel__loading">
                        Layout wird geladen...
                    </div>
                ) : !selectedLayout ? (
                    <div className="z21-test-panel__empty">
                        <strong>
                            Kein Layout vorhanden
                        </strong>

                        <span>
                            Lege zuerst ein Layout an.
                        </span>
                    </div>
                ) : !firstTurnout ? (
                    <div className="z21-test-panel__empty">
                        <strong>
                            Keine Weiche gefunden
                        </strong>

                        <span>
                            Im ersten Layout wurde
                            keine TURNOUT-Zelle gefunden.
                        </span>
                    </div>
                ) : (
                    <div className="z21-test-panel__content">

                        <div className="z21-test-panel__system-info">
                            <div>
                                <span>
                                    Layout
                                </span>

                                <strong>
                                    {selectedLayout.name}
                                </strong>
                            </div>

                            <div>
                                <span>
                                    Position
                                </span>

                                <strong>
                                    {firstTurnout.x},
                                    {" "}
                                    {firstTurnout.y}
                                </strong>
                            </div>

                            {firstTurnout.digitalAddress != null && (
                                <div>
                                    <span>
                                        Digitaladresse
                                    </span>

                                    <strong>
                                        {
                                            firstTurnout.digitalAddress
                                        }
                                    </strong>
                                </div>
                            )}

                            {firstTurnout.digitalPort != null && (
                                <div>
                                    <span>
                                        Digitalport
                                    </span>

                                    <strong>
                                        {
                                            firstTurnout.digitalPort
                                        }
                                    </strong>
                                </div>
                            )}

                            {firstTurnout.digitalSystem && (
                                <div>
                                    <span>
                                        Digitalsystem
                                    </span>

                                    <strong>
                                        {
                                            firstTurnout
                                                .digitalSystem
                                                .name ||
                                            firstTurnout
                                                .digitalSystem
                                                .model ||
                                            firstTurnout
                                                .digitalSystem
                                                .id
                                        }
                                    </strong>
                                </div>
                            )}
                        </div>

                        <div className="z21-test-panel__actions">
                            <button
                                type="button"
                                className="z21-test-panel__button z21-test-panel__button--left"
                                onClick={() =>
                                    handleTest("LEFT")
                                }
                                disabled={testing}
                            >
                                {testing
                                    ? "Sende..."
                                    : "◀ Links"}
                            </button>

                            <button
                                type="button"
                                className="z21-test-panel__button z21-test-panel__button--right"
                                onClick={() =>
                                    handleTest("RIGHT")
                                }
                                disabled={testing}
                            >
                                {testing
                                    ? "Sende..."
                                    : "Rechts ▶"}
                            </button>
                        </div>

                        {status && (
                            <div
                                className={
                                    "z21-test-panel__status " +
                                    `z21-test-panel__status--${status.type}`
                                }
                            >
                                {status.message}
                            </div>
                        )}
                    </div>
                )}
            </section>
        </main>
    );
}
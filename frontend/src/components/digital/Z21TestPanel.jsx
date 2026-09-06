import {
    useEffect,
    useState,
} from "react";

import {
    getDigitalSystems,
    testTurnout,
} from "../../api/digitalSystems";

import "./Z21TestPanel.css";

export default function Z21TestPanel() {

    const [
        digitalSystems,
        setDigitalSystems,
    ] = useState([]);

    const [
        selectedSystemId,
        setSelectedSystemId,
    ] = useState("");

    const [
        digitalAddress,
        setDigitalAddress,
    ] = useState(1);

    const [
        digitalPort,
        setDigitalPort,
    ] = useState(1);

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
        loadDigitalSystems();
    }, []);

    async function loadDigitalSystems() {

        setLoading(true);
        setStatus(null);

        try {

            const systems =
                await getDigitalSystems();

            setDigitalSystems(
                Array.isArray(systems)
                    ? systems
                    : []
            );

            if (systems.length > 0) {
                setSelectedSystemId(
                    String(systems[0].id)
                );
            }

        } catch (error) {

            console.error(
                "Could not load digital systems:",
                error
            );

            setStatus({
                type: "error",
                message:
                    error.message ||
                    "Digitalsysteme konnten nicht geladen werden.",
            });

        } finally {

            setLoading(false);
        }
    }

    async function handleTest(state) {

        if (!selectedSystemId) {

            setStatus({
                type: "error",
                message:
                    "Bitte zuerst ein Digitalsystem auswählen.",
            });

            return;
        }

        const address =
            Number(digitalAddress);

        const port =
            Number(digitalPort);

        if (
            !Number.isInteger(address) ||
            address < 0
        ) {

            setStatus({
                type: "error",
                message:
                    "Bitte eine gültige Digitaladresse eingeben.",
            });

            return;
        }

        if (
            !Number.isInteger(port) ||
            port < 1 ||
            port > 4
        ) {

            setStatus({
                type: "error",
                message:
                    "Der Digitalport muss zwischen 1 und 4 liegen.",
            });

            return;
        }

        setTesting(true);
        setStatus(null);

        try {

            const result =
                await testTurnout({
                    digitalSystemId:
                        selectedSystemId,
                    digitalAddress:
                        address,
                    digitalPort:
                        port,
                    state,
                });

            setStatus({
                type: "success",
                message:
                    result?.message ||
                    `Weichenbefehl ${state} wurde gesendet.`,
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

    const selectedSystem =
        digitalSystems.find(
            (system) =>
                String(system.id)
                === String(selectedSystemId)
        );

    return (
        <main className="z21-test-page">

            <section className="z21-test-panel">

                <div className="z21-test-panel__header">

                    <div>
                        <h1>
                            Z21 Test
                        </h1>

                        <p>
                            Teste eine Weiche direkt
                            über das angeschlossene
                            Digitalsystem.
                        </p>
                    </div>

                </div>

                {loading ? (

                    <div className="z21-test-panel__loading">
                        Digitalsysteme werden geladen...
                    </div>

                ) : digitalSystems.length === 0 ? (

                    <div className="z21-test-panel__empty">

                        <strong>
                            Kein Digitalsystem vorhanden
                        </strong>

                        <span>
                            Lege zuerst ein Digitalsystem
                            an, zum Beispiel eine
                            Roco/Fleischmann Z21.
                        </span>

                    </div>

                ) : (

                    <div className="z21-test-panel__content">

                        <div className="z21-test-panel__form">

                            <label>

                                <span>
                                    Digitalsystem
                                </span>

                                <select
                                    value={selectedSystemId}
                                    onChange={(event) =>
                                        setSelectedSystemId(
                                            event.target.value
                                        )
                                    }
                                    disabled={testing}
                                >

                                    {digitalSystems.map(
                                        (system) => (

                                            <option
                                                key={system.id}
                                                value={system.id}
                                            >
                                                {system.name}
                                            </option>

                                        )
                                    )}

                                </select>

                            </label>

                            <label>

                                <span>
                                    Digitaladresse
                                </span>

                                <input
                                    type="number"
                                    min="0"
                                    step="1"
                                    value={digitalAddress}
                                    onChange={(event) =>
                                        setDigitalAddress(
                                            event.target.value
                                        )
                                    }
                                    disabled={testing}
                                />

                            </label>

                            <label>

                                <span>
                                    Digitalport
                                </span>

                                <select
                                    value={digitalPort}
                                    onChange={(event) =>
                                        setDigitalPort(
                                            event.target.value
                                        )
                                    }
                                    disabled={testing}
                                >

                                    <option value="1">
                                        Port 1
                                    </option>

                                    <option value="2">
                                        Port 2
                                    </option>

                                    <option value="3">
                                        Port 3
                                    </option>

                                    <option value="4">
                                        Port 4
                                    </option>

                                </select>

                            </label>

                        </div>

                        {selectedSystem && (

                            <div className="z21-test-panel__system-info">

                                <div>
                                    <span>
                                        Hersteller
                                    </span>

                                    <strong>
                                        {
                                            selectedSystem.manufacturer
                                        }
                                    </strong>
                                </div>

                                <div>
                                    <span>
                                        Modell
                                    </span>

                                    <strong>
                                        {
                                            selectedSystem.model
                                        }
                                    </strong>
                                </div>

                                <div>
                                    <span>
                                        Schnittstelle
                                    </span>

                                    <strong>
                                        {
                                            selectedSystem.interfaceType
                                        }
                                    </strong>
                                </div>

                                {selectedSystem.host && (

                                    <div>
                                        <span>
                                            Host
                                        </span>

                                        <strong>
                                            {
                                                selectedSystem.host
                                            }

                                            {selectedSystem.port
                                                ? `:${selectedSystem.port}`
                                                : ""}
                                        </strong>
                                    </div>

                                )}

                            </div>

                        )}

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
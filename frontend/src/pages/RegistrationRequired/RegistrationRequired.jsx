import { useState } from "react";
import { toast } from "react-toastify";
import keycloak from "../../auth/keycloak";

import "./RegistrationRequired.css";

export default function RegistrationRequired({
    onRegistered
}) {

    const [code, setCode] = useState("");
    const [loading, setLoading] = useState(false);

    async function handleSubmit(event) {

        event.preventDefault();

        const normalizedCode =
            code.trim().toUpperCase();

        if (!normalizedCode) {
            toast.error(
                "Bitte geben Sie einen Registrierungscode ein."
            );

            return;
        }

        setLoading(true);

        try {

            const response = await fetch(
                "http://localhost:8080/api/registration-codes/complete",
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json",
                        Authorization:
                            `Bearer ${keycloak.token}`
                    },

                    body: JSON.stringify({
                        code: normalizedCode
                    })
                }
            );

            if (!response.ok) {

                const message =
                    response.status === 404
                        ? "Der Registrierungscode ist ungültig oder abgelaufen."
                        : "Die Registrierung konnte nicht abgeschlossen werden.";

                throw new Error(message);
            }

            toast.success(
                "Registrierung erfolgreich abgeschlossen."
            );

            if (onRegistered) {
                await onRegistered();
            }

        } catch (error) {

            toast.error(
                error.message ||
                "Die Registrierung konnte nicht abgeschlossen werden."
            );

        } finally {

            setLoading(false);

        }
    }

    return (
        <div className="registration-required-page">

            <div className="registration-required-card">

                <h1>
                    Registrierung erforderlich
                </h1>

                <p>
                    Für Ihren Account wurde noch keine Rolle vergeben.
                    Bitte geben Sie Ihren Registrierungscode ein.
                </p>

                <form onSubmit={handleSubmit}>

                    <input
                        type="text"
                        value={code}
                        onChange={(event) =>
                            setCode(event.target.value)
                        }
                        placeholder="Registrierungscode"
                        autoComplete="off"
                        disabled={loading}
                    />

                    <button
                        type="submit"
                        disabled={loading}
                    >
                        {
                            loading
                                ? "Registrierung..."
                                : "Registrierung abschließen"
                        }
                    </button>

                </form>

                <button
                    type="button"
                    className="logout-button"
                    onClick={() =>
                        keycloak.logout({
                            redirectUri:
                                window.location.origin
                        })
                    }
                >
                    Abmelden
                </button>

            </div>

        </div>
    );
}
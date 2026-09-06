import { apiFetch } from "./apiClient";

export async function getDigitalSystems() {
    const response = await apiFetch(
        "/api/digital-systems"
    );

    return response.json();
}

export async function testTurnout({
    digitalSystemId,
    digitalAddress,
    digitalPort,
    state,
}) {
    const response = await apiFetch(
        `/api/digital-systems/${digitalSystemId}/test/turnout?` +
        new URLSearchParams({
            digitalAddress: String(digitalAddress),
            digitalPort: String(digitalPort),
            state,
        }),
        {
            method: "POST",
        }
    );

    if (response.status === 204) {
        return null;
    }

    return response.json();
}
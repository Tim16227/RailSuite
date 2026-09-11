import { apiFetch } from "./apiClient";

export async function getDigitalSystems() {
    const response = await apiFetch(
        "/api/digital-systems"
    );

    return response.json();
}
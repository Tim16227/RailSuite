import { apiFetch } from "./apiClient";

export async function getLayouts() {
    const response = await apiFetch("/api/layouts");

    return response.json();
}

export async function getLayout(layoutId) {
    const response = await apiFetch(
        `/api/layouts/${layoutId}`
    );

    return response.json();
}

export async function createLayout(layout) {
    const response = await apiFetch(
        "/api/layouts",
        {
            method: "POST",
            body: JSON.stringify(layout),
        }
    );

    return response.json();
}

export async function updateLayout(
    layoutId,
    layout
) {
    const response = await apiFetch(
        `/api/layouts/${layoutId}`,
        {
            method: "PUT",
            body: JSON.stringify(layout),
        }
    );

    return response.json();
}

export async function setLayoutCell(
    layoutId,
    x,
    y,
    elementType,
    orientation,
    turnoutHand = null
) {
    const response = await apiFetch(
        `/api/layouts/${layoutId}/cells/${x}/${y}`,
        {
            method: "PUT",
            body: JSON.stringify({
                elementType,
                orientation,
                turnoutHand,
            }),
        }
    );

    return response.json();
}

export async function deleteLayoutCell(
    layoutId,
    x,
    y
) {
    await apiFetch(
        `/api/layouts/${layoutId}/cells/${x}/${y}`,
        {
            method: "DELETE",
        }
    );
}
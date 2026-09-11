import {
    apiFetch,
} from "./apiClient";

export async function getBlockEditor(
    layoutId,
    blockId
) {
    const response =
        await apiFetch(
            `/api/layouts/${layoutId}/block-editor/${blockId}`
        );

    return response.json();
}

export async function updateBlockEditor(
    layoutId,
    blockId,
    block
) {
    const response =
        await apiFetch(
            `/api/layouts/${layoutId}/block-editor/${blockId}`,
            {
                method: "PUT",
                body: JSON.stringify(
                    block
                ),
            }
        );

    return response.json();
}

export async function createBlockEditorMarker(
    layoutId,
    blockId,
    marker
) {
    const response =
        await apiFetch(
            `/api/layouts/${layoutId}/block-editor/${blockId}/markers`,
            {
                method: "POST",
                body: JSON.stringify(
                    marker
                ),
            }
        );

    return response.json();
}

export async function updateBlockEditorMarker(
    layoutId,
    markerId,
    marker
) {
    const response =
        await apiFetch(
            `/api/layouts/${layoutId}/block-editor/markers/${markerId}`,
            {
                method: "PUT",
                body: JSON.stringify(
                    marker
                ),
            }
        );

    return response.json();
}

export async function deleteBlockEditorMarker(
    layoutId,
    markerId
) {
    await apiFetch(
        `/api/layouts/${layoutId}/block-editor/markers/${markerId}`,
        {
            method: "DELETE",
        }
    );
}

export async function updateBlockEditorContact(
    layoutId,
    blockId,
    assignmentId,
    contact
) {
    const response =
        await apiFetch(
            `/api/layouts/${layoutId}/block-editor/${blockId}/contacts/${assignmentId}`,
            {
                method: "PUT",
                body: JSON.stringify(
                    contact
                ),
            }
        );

    return response.json();
}

export async function updateBlockEditorSignal(
    layoutId,
    blockId,
    side,
    signalType
) {
    const response =
        await apiFetch(
            `/api/layouts/${layoutId}/block-editor/${blockId}/signals/${side}`,
            {
                method: "PUT",
                body: JSON.stringify({
                    signalType,
                }),
            }
        );

    return response.json();
}
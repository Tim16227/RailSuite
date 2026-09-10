import { apiFetch } from "./apiClient";

export async function getBlocks(
  layoutId
) {
  const response =
    await apiFetch(
      `/api/layouts/${layoutId}/blocks`
    );

  return response.json();
}

export async function createBlock(
  layoutId,
  block
) {
  const response =
    await apiFetch(
      `/api/layouts/${layoutId}/blocks`,
      {
        method: "POST",
        body: JSON.stringify(block),
      }
    );

  return response.json();
}

export async function updateBlock(
  layoutId,
  blockId,
  block
) {
  const response =
    await apiFetch(
      `/api/layouts/${layoutId}/blocks/${blockId}`,
      {
        method: "PUT",
        body: JSON.stringify(block),
      }
    );

  return response.json();
}

export async function deleteBlock(
  layoutId,
  blockId
) {
  await apiFetch(
    `/api/layouts/${layoutId}/blocks/${blockId}`,
    {
      method: "DELETE",
    }
  );
}

export async function addBlockMarker(
  layoutId,
  blockId,
  marker
) {
  const response =
    await apiFetch(
      `/api/layouts/${layoutId}/blocks/${blockId}/markers`,
      {
        method: "POST",
        body: JSON.stringify(marker),
      }
    );

  return response.json();
}

export async function updateBlockMarker(
  layoutId,
  markerId,
  marker
) {
  const response =
    await apiFetch(
      `/api/layouts/${layoutId}/block-markers/${markerId}`,
      {
        method: "PUT",
        body: JSON.stringify(marker),
      }
    );

  return response.json();
}

export async function deleteBlockMarker(
  layoutId,
  markerId
) {
  await apiFetch(
    `/api/layouts/${layoutId}/block-markers/${markerId}`,
    {
      method: "DELETE",
    }
  );
}

export async function getContactDetectors(
  layoutId
) {
  const response =
    await apiFetch(
      `/api/layouts/${layoutId}/contact-detectors`
    );

  return response.json();
}

export async function createContactDetector(
  layoutId,
  detector
) {
  const response =
    await apiFetch(
      `/api/layouts/${layoutId}/contact-detectors`,
      {
        method: "POST",
        body: JSON.stringify(
          detector
        ),
      }
    );

  return response.json();
}

export async function deleteContactDetector(
  layoutId,
  detectorId
) {
  await apiFetch(
    `/api/layouts/${layoutId}/contact-detectors/${detectorId}`,
    {
      method: "DELETE",
    }
  );
}

export async function assignContactDetector(
  layoutId,
  blockId,
  assignment
) {
  const response =
    await apiFetch(
      `/api/layouts/${layoutId}/blocks/${blockId}/contacts`,
      {
        method: "POST",
        body: JSON.stringify(
          assignment
        ),
      }
    );

  return response.json();
}

export async function deleteContactAssignment(
  layoutId,
  assignmentId
) {
  await apiFetch(
    `/api/layouts/${layoutId}/block-contact-assignments/${assignmentId}`,
    {
      method: "DELETE",
    }
  );
}
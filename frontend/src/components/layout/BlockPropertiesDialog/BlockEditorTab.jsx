import {
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react";

import useDialogs from "../../dialog/utils/useDialogs";

import {
    createContactDetector,
    getContactDetectors,
    assignContactDetector,
    deleteContactAssignment,
    updateContactDetector,
} from "../../../api/blockApi";

import {
    createBlockEditorMarker,
    updateBlockEditorMarker,
    deleteBlockEditorMarker,
    updateBlockEditorContact,
    updateBlockEditorSignal,
} from "../../../api/blockEditorApi";

import {
    apiFetch,
} from "../../../api/apiClient";

import {
    BlockContactRole,
    BlockDirection,
    BlockGridOrientation,
    BlockMarkerTrainPosition,
    BlockMarkerType,
    BlockSignalSide,
    BlockSignalType,
    ContactDetectorType,
} from "../../../models/block";

import "./BlockEditorTab.css";

const AXIS_LENGTH = 760;
const FLAG_HEIGHT = 42;
const SIGNAL_WIDTH = 36;

const markerColors = {
    [BlockMarkerType.STOP]: "#d73535",
    [BlockMarkerType.BRAKE]: "#d7b400",
    [BlockMarkerType.SPEED]: "#36a852",
};

function clamp(value, min, max) {
    return Math.min(
        max,
        Math.max(min, value)
    );
}

function markerLabel(type) {
    switch (type) {
        case BlockMarkerType.STOP:
            return "Haltemarkierung";

        case BlockMarkerType.BRAKE:
            return "Bremsmarkierung";

        case BlockMarkerType.SPEED:
            return "Geschwindigkeitsmarkierung";

        default:
            return type;
    }
}

function markerColor(type) {
    return (
        markerColors[type] ??
        "#777"
    );
}

function getMarkerDirectionLabel(direction) {
    if (
        direction ===
        BlockDirection.FORWARD
    ) {
        return "←";
    }

    return "→";
}

function getContactPosition(contact) {
    return Number.isFinite(
        Number(contact?.positionMm)
    )
        ? Number(contact.positionMm)
        : 0;
}

function getContactLength(contact, blockLength) {
    const value =
        Number(contact?.lengthMm);

    if (
        Number.isFinite(value) &&
        value > 0
    ) {
        return value;
    }

    return Math.max(
        1,
        Math.round(
            blockLength / 4
        )
    );
}

function MarkerFlag({
    marker,
    contact,
    blockLength,
    orientation,
    selected,
    onClick,
}) {
    const contactStart =
        getContactPosition(contact);

    const contactLength =
        getContactLength(
            contact,
            blockLength
        );

    const distance =
        clamp(
            Number(marker.positionMm) || 0,
            0,
            contactLength
        );

    const ramp =
        marker.type ===
        BlockMarkerType.STOP
            ? 0
            : clamp(
                  Number(marker.lengthMm) ||
                      0,
                  0,
                  Math.max(
                      0,
                      contactLength -
                          distance
                  )
              );

    const total =
        Math.max(
            1,
            contactLength
        );

    const relativePosition =
        clamp(
            (
                distance +
                ramp
            ) /
                total,
            0,
            1
        );

    const mastPosition =
        clamp(
            distance / total,
            0,
            1
        );

    const color =
        markerColor(
            marker.type
        );

    const direction =
        marker.direction;

    const isForward =
        direction ===
        BlockDirection.FORWARD;

    const flagStyle =
        orientation ===
        BlockGridOrientation.HORIZONTAL
            ? {
                  left: `${mastPosition * 100}%`,
                  "--flag-ramp":
                      `${Math.max(
                          8,
                          relativePosition *
                              100 -
                              mastPosition *
                                  100
                      )}%`,
              }
            : {
                  top: `${mastPosition * 100}%`,
                  "--flag-ramp":
                      `${Math.max(
                          8,
                          relativePosition *
                              100 -
                              mastPosition *
                                  100
                      )}%`,
              };

    return (
        <button
            type="button"
            className={[
                "block-editor-marker-flag",
                isForward
                    ? "direction-forward"
                    : "direction-reverse",
                selected
                    ? "selected"
                    : "",
            ]
                .filter(Boolean)
                .join(" ")}
            style={{
                ...flagStyle,
                "--marker-color":
                    color,
            }}
            title={`${markerLabel(
                marker.type
            )} ${getMarkerDirectionLabel(
                direction
            )}`}
            onClick={(event) => {
                event.stopPropagation();
                onClick();
            }}
        >
            <span className="block-editor-marker-mast" />

            <span
                className="block-editor-marker-flag-shape"
            />

            <span className="block-editor-marker-distance">
                {distance} mm
            </span>

            {ramp > 0 && (
                <span className="block-editor-marker-ramp">
                    {ramp} mm
                </span>
            )}

            <span className="block-editor-marker-direction">
                {getMarkerDirectionLabel(
                    direction
                )}
            </span>
        </button>
    );
}

function BlockSignal({
    side,
    signal,
    orientation,
    selected,
    onClick,
}) {
    const isStart =
        side ===
        BlockSignalSide.START;

    return (
        <button
            type="button"
            className={[
                "block-editor-signal",
                isStart
                    ? "start"
                    : "end",
                selected
                    ? "selected"
                    : "",
            ]
                .filter(Boolean)
                .join(" ")}
            onClick={(event) => {
                event.stopPropagation();
                onClick();
            }}
            title={`Blocksignal ${
                isStart
                    ? "links"
                    : "rechts"
            }`}
        >
            <span className="block-editor-signal-body">
                {signal?.signalType ===
                BlockSignalType.NONE
                    ? ""
                    : signal?.signalType ===
                        BlockSignalType.TWO_ASPECT
                      ? "2"
                      : signal?.signalType ===
                          BlockSignalType.THREE_ASPECT
                        ? "3"
                        : signal?.signalType ===
                            BlockSignalType.FOUR_ASPECT
                          ? "4"
                          : ""}
            </span>
        </button>
    );
}

export default function BlockEditorTab({
    layoutId,
    blockId,
    data,
    onDataChanged,
}) {
    const {
        open,
    } = useDialogs();

    const [
        orientation,
        setOrientation,
    ] = useState(
        data?.gridOrientation ??
            BlockGridOrientation.HORIZONTAL
    );

    const [
        selectedMarkerId,
        setSelectedMarkerId,
    ] = useState(null);

    const [
        selectedContactId,
        setSelectedContactId,
    ] = useState(null);

    const [
        selectedSignalSide,
        setSelectedSignalSide,
    ] = useState(null);

    const [
        tool,
        setTool,
    ] = useState("NONE");

    const [
        detectors,
        setDetectors,
    ] = useState([]);

    const [
        digitalSystems,
        setDigitalSystems,
    ] = useState([]);

    const dragRef =
        useRef(null);

    const dataRef =
        useRef(data);

    useEffect(() => {
        dataRef.current =
            data;
    }, [data]);

    const occupancyContacts =
        useMemo(
            () =>
                (
                    data?.contacts ??
                    []
                ).filter(
                    (contact) =>
                        contact.role ===
                        BlockContactRole.OCCUPANCY
                ),
            [data?.contacts]
        );

    const selectedContact =
        occupancyContacts.find(
            (contact) =>
                contact.id ===
                selectedContactId
        ) ?? null;

    const selectedMarker =
        data?.markers?.find(
            (marker) =>
                marker.id ===
                selectedMarkerId
        ) ?? null;

    const selectedSignal =
        data?.signals?.find(
            (signal) =>
                signal.side ===
                selectedSignalSide
        ) ?? null;

    useEffect(() => {
        let active = true;

        async function loadAuxiliaryData() {
            try {
                const [
                    loadedDetectors,
                    systemsResponse,
                ] = await Promise.all([
                    getContactDetectors(
                        layoutId
                    ),
                    apiFetch(
                        "/api/digital-systems"
                    ),
                ]);

                const systems =
                    await systemsResponse.json();

                if (!active) {
                    return;
                }

                setDetectors(
                    loadedDetectors ?? []
                );

                setDigitalSystems(
                    systems ?? []
                );
            } catch (error) {
                console.error(
                    "Kontaktdaten konnten nicht geladen werden:",
                    error
                );
            }
        }

        void loadAuxiliaryData();

        return () => {
            active = false;
        };
    }, [layoutId]);

    useEffect(() => {
        setOrientation(
            data?.gridOrientation ??
                BlockGridOrientation.HORIZONTAL
        );

        setSelectedMarkerId(
            null
        );

        setSelectedContactId(
            null
        );

        setSelectedSignalSide(
            null
        );

        setTool(
            "NONE"
        );
    }, [data?.id]);

    function updateData(patch) {
        if (!onDataChanged) {
            return;
        }

        onDataChanged({
            ...dataRef.current,
            ...patch,
        });
    }

    async function changeOrientation(
        value
    ) {
        setOrientation(value);

        try {
            const response =
                await apiFetch(
                    `/api/layouts/${layoutId}/block-editor/${blockId}`,
                    {
                        method: "PUT",
                        body: JSON.stringify({
                            name:
                                data.name,
                            lengthMm:
                                data.lengthMm,
                            direction:
                                data.direction,
                            showSignals:
                                data.showSignals,
                            visibleOnlyInEditMode:
                                data.visibleOnlyInEditMode,
                            requestYellow:
                                data.requestYellow,
                            maximumSpeedKmh:
                                data.maximumSpeedKmh,
                            slowSpeedKmh:
                                data.slowSpeedKmh,
                            includeInTrainTracking:
                                data.includeInTrainTracking,
                            maximumTrainLengthMm:
                                data.maximumTrainLengthMm,
                            gridOrientation:
                                value,
                        }),
                    }
                );

            const updated =
                await response.json();

            updateData(updated);
        } catch (error) {
            console.error(
                "Ausrichtung konnte nicht gespeichert werden:",
                error
            );
        }
    }

    function getContactSectionLength(
        contact
    ) {
        return getContactLength(
            contact,
            data.lengthMm
        );
    }

    async function createMarker(
        type,
        direction
    ) {
        if (!selectedContact) {
            return;
        }

        const contactLength =
            getContactSectionLength(
                selectedContact
            );

        const lengthMm =
            type ===
            BlockMarkerType.STOP
                ? 0
                : Math.min(
                      100,
                      Math.max(
                          1,
                          contactLength
                      )
                  );

        try {
            const marker =
                await createBlockEditorMarker(
                    layoutId,
                    blockId,
                    {
                        type,
                        contactAssignmentId:
                            selectedContact.id,
                        positionMm: 0,
                        lengthMm,
                        direction,
                        trainPosition:
                            BlockMarkerTrainPosition.FRONT,
                        scheduledStop:
                            false,
                    }
                );

            updateData({
                markers: [
                    ...(dataRef.current.markers ??
                        []),
                    marker,
                ],
            });

            setSelectedMarkerId(
                marker.id
            );

            setTool(
                "PROPERTIES"
            );

            setSelectedSignalSide(
                null
            );
        } catch (error) {
            console.error(
                "Markierung konnte nicht angelegt werden:",
                error
            );
        }
    }

    async function updateMarker(
        marker,
        patch
    ) {
        const contact =
            occupancyContacts.find(
                (item) =>
                    item.id ===
                    (
                        patch.contactAssignmentId ??
                        marker.contactAssignmentId
                    )
            );

        if (!contact) {
            return;
        }

        const contactLength =
            getContactSectionLength(
                contact
            );

        const positionMm =
            clamp(
                Number(
                    patch.positionMm ??
                        marker.positionMm
                ),
                0,
                contactLength
            );

        const isStop =
            (
                patch.type ??
                marker.type
            ) ===
            BlockMarkerType.STOP;

        const lengthMm =
            isStop
                ? 0
                : clamp(
                      Number(
                          patch.lengthMm ??
                              marker.lengthMm
                      ),
                      1,
                      Math.max(
                          1,
                          contactLength -
                              positionMm
                      )
                  );

        try {
            const updated =
                await updateBlockEditorMarker(
                    layoutId,
                    marker.id,
                    {
                        type:
                            patch.type ??
                            marker.type,
                        contactAssignmentId:
                            contact.id,
                        positionMm,
                        lengthMm,
                        direction:
                            patch.direction ??
                            marker.direction,
                        trainPosition:
                            patch.trainPosition ??
                            marker.trainPosition,
                        scheduledStop:
                            patch.scheduledStop ??
                            marker.scheduledStop,
                    }
                );

            updateData({
                markers:
                    (
                        dataRef.current
                            .markers ??
                        []
                    ).map(
                        (item) =>
                            item.id ===
                            updated.id
                                ? updated
                                : item
                    ),
            });
        } catch (error) {
            console.error(
                "Markierung konnte nicht gespeichert werden:",
                error
            );
        }
    }

    async function removeSelected() {
        if (selectedMarker) {
            try {
                await deleteBlockEditorMarker(
                    layoutId,
                    selectedMarker.id
                );

                updateData({
                    markers:
                        (
                            dataRef.current
                                .markers ??
                            []
                        ).filter(
                            (marker) =>
                                marker.id !==
                                selectedMarker.id
                        ),
                });

                setSelectedMarkerId(
                    null
                );
            } catch (error) {
                console.error(
                    "Markierung konnte nicht gelöscht werden:",
                    error
                );
            }

            return;
        }

        if (selectedContact) {
            try {
                await deleteContactAssignment(
                    layoutId,
                    selectedContact.id
                );

                updateData({
                    contacts:
                        (
                            dataRef.current
                                .contacts ??
                            []
                        ).filter(
                            (contact) =>
                                contact.id !==
                                selectedContact.id
                        ),
                });

                setSelectedContactId(
                    null
                );
            } catch (error) {
                console.error(
                    "Kontaktzuordnung konnte nicht gelöscht werden:",
                    error
                );
            }

            return;
        }

        if (selectedSignalSide) {
            await updateSignal(
                selectedSignalSide,
                BlockSignalType.NONE
            );

            setSelectedSignalSide(
                null
            );
        }
    }

    async function updateContact(
        contact,
        positionMm,
        lengthMm
    ) {
        const safePosition =
            clamp(
                Number(positionMm),
                0,
                dataRef.current.lengthMm
            );

        const safeLength =
            clamp(
                Number(lengthMm),
                1,
                Math.max(
                    1,
                    dataRef.current.lengthMm -
                        safePosition
                )
            );

        try {
            const updated =
                await updateBlockEditorContact(
                    layoutId,
                    blockId,
                    contact.id,
                    {
                        positionMm:
                            safePosition,
                        lengthMm:
                            safeLength,
                    }
                );

            updateData({
                contacts:
                    (
                        dataRef.current
                            .contacts ??
                        []
                    ).map(
                        (item) =>
                            item.id ===
                            updated.id
                                ? updated
                                : item
                    ),
            });
        } catch (error) {
            console.error(
                "Belegtmelder konnte nicht geändert werden:",
                error
            );
        }
    }

    async function updateSignal(
        side,
        type
    ) {
        try {
            const signal =
                await updateBlockEditorSignal(
                    layoutId,
                    blockId,
                    side,
                    type
                );

            updateData({
                signals:
                    (
                        dataRef.current
                            .signals ??
                        []
                    ).map(
                        (item) =>
                            item.side ===
                            side
                                ? signal
                                : item
                    ),
            });
        } catch (error) {
            console.error(
                "Blocksignal konnte nicht gespeichert werden:",
                error
            );
        }
    }

    function getPositionFromPointer(
        event
    ) {
        const rect =
            event.currentTarget.getBoundingClientRect();

        const coordinate =
            orientation ===
            BlockGridOrientation.HORIZONTAL
                ? event.clientX -
                  rect.left
                : event.clientY -
                  rect.top;

        return clamp(
            Math.round(
                (
                    coordinate /
                    AXIS_LENGTH
                ) *
                    dataRef.current
                        .lengthMm
            ),
            0,
            dataRef.current
                .lengthMm
        );
    }

    function handleCanvasClick(
        event
    ) {
        if (
            tool === "NEW_STOP_LEFT" ||
            tool === "NEW_BRAKE_LEFT" ||
            tool === "NEW_SPEED_LEFT"
        ) {
            if (!selectedContact) {
                return;
            }

            const type =
                tool ===
                "NEW_STOP_LEFT"
                    ? BlockMarkerType.STOP
                    : tool ===
                        "NEW_BRAKE_LEFT"
                      ? BlockMarkerType.BRAKE
                      : BlockMarkerType.SPEED;

            void createMarker(
                type,
                BlockDirection.FORWARD
            );

            return;
        }

        if (
            tool === "NEW_STOP_RIGHT" ||
            tool === "NEW_BRAKE_RIGHT" ||
            tool === "NEW_SPEED_RIGHT"
        ) {
            if (!selectedContact) {
                return;
            }

            const type =
                tool ===
                "NEW_STOP_RIGHT"
                    ? BlockMarkerType.STOP
                    : tool ===
                        "NEW_BRAKE_RIGHT"
                      ? BlockMarkerType.BRAKE
                      : BlockMarkerType.SPEED;

            void createMarker(
                type,
                BlockDirection.REVERSE
            );

            return;
        }

        if (
            tool ===
                "NEW_CONTACT" ||
            tool ===
                "VIRTUAL_CONTACT"
        ) {
            const positionMm =
                getPositionFromPointer(
                    event
                );

            open(
                "layout-contact-detector",
                {
                    layoutId,
                    blockId,
                    positionMm,
                    type:
                        tool ===
                        "VIRTUAL_CONTACT"
                            ? ContactDetectorType.VIRTUAL
                            : ContactDetectorType.PHYSICAL,
                    digitalSystems,
                    onSaved:
                        handleContactSaved,
                }
            );
        }
    }

    async function handleContactSaved(
        result
    ) {
        const {
            detector,
            assignment,
        } = result;

        setDetectors(
            (current) => {
                const exists =
                    current.some(
                        (item) =>
                            item.id ===
                            detector.id
                    );

                return exists
                    ? current.map(
                          (item) =>
                              item.id ===
                              detector.id
                                  ? detector
                                  : item
                      )
                    : [
                          ...current,
                          detector,
                      ];
            }
        );

        const currentContacts =
            dataRef.current
                .contacts ?? [];

        const exists =
            currentContacts.some(
                (item) =>
                    item.id ===
                    assignment.id
            );

        updateData({
            contacts: exists
                ? currentContacts.map(
                      (item) =>
                          item.id ===
                          assignment.id
                              ? assignment
                              : item
                  )
                : [
                      ...currentContacts,
                      assignment,
                  ],
        });

        setSelectedContactId(
            assignment.id
        );
    }

    function startContactDrag(
        event,
        contact,
        edge
    ) {
        event.stopPropagation();
        event.preventDefault();

        dragRef.current = {
            contactId:
                contact.id,
            edge,
            positionMm:
                getContactPosition(
                    contact
                ),
            lengthMm:
                getContactSectionLength(
                    contact
                ),
        };

        window.addEventListener(
            "pointermove",
            handleContactDrag
        );

        window.addEventListener(
            "pointerup",
            finishContactDrag,
            {
                once: true,
            }
        );
    }

    function handleContactDrag(
        event
    ) {
        const drag =
            dragRef.current;

        if (!drag) {
            return;
        }

        const canvas =
            document.querySelector(
                ".block-editor-preview-track"
            );

        if (!canvas) {
            return;
        }

        const rect =
            canvas.getBoundingClientRect();

        const coordinate =
            orientation ===
            BlockGridOrientation.HORIZONTAL
                ? event.clientX -
                  rect.left
                : event.clientY -
                  rect.top;

        const position =
            clamp(
                Math.round(
                    (
                        coordinate /
                        AXIS_LENGTH
                    ) *
                        dataRef.current
                            .lengthMm
                ),
                0,
                dataRef.current
                    .lengthMm
            );

        const contact =
            (
                dataRef.current
                    .contacts ??
                []
            ).find(
                (item) =>
                    item.id ===
                    drag.contactId
            );

        if (!contact) {
            return;
        }

        let newPosition =
            getContactPosition(
                contact
            );

        let newLength =
            getContactSectionLength(
                contact
            );

        if (
            drag.edge ===
            "start"
        ) {
            const end =
                getContactPosition(
                    contact
                ) +
                getContactSectionLength(
                    contact
                );

            newPosition =
                clamp(
                    position,
                    0,
                    end - 1
                );

            newLength =
                end -
                newPosition;
        } else {
            const start =
                getContactPosition(
                    contact
                );

            const newEnd =
                clamp(
                    position,
                    start + 1,
                    dataRef.current
                        .lengthMm
                );

            newLength =
                newEnd -
                start;
        }

        drag.positionMm =
            newPosition;

        drag.lengthMm =
            newLength;

        updateData({
            contacts:
                (
                    dataRef.current
                        .contacts ??
                    []
                ).map(
                    (item) =>
                        item.id ===
                        contact.id
                            ? {
                                  ...item,
                                  positionMm:
                                      newPosition,
                                  lengthMm:
                                      newLength,
                              }
                            : item
                ),
        });
    }

    function finishContactDrag() {
        window.removeEventListener(
            "pointermove",
            handleContactDrag
        );

        const drag =
            dragRef.current;

        if (!drag) {
            return;
        }

        const contact =
            (
                dataRef.current
                    .contacts ??
                []
            ).find(
                (item) =>
                    item.id ===
                    drag.contactId
            );

        if (contact) {
            void updateContact(
                contact,
                drag.positionMm,
                drag.lengthMm
            );
        }

        dragRef.current =
            null;
    }

    function openContactDialog(
        contact
    ) {
        const detector =
            detectors.find(
                (item) =>
                    item.id ===
                    contact.contactDetectorId
            );

        if (!detector) {
            return;
        }

        open(
            "layout-contact-detector",
            {
                layoutId,
                blockId,
                assignment:
                    contact,
                detector,
                digitalSystems,
                onSaved:
                    handleContactSaved,
            }
        );
    }

    function getMarkerPosition(
        marker,
        contact
    ) {
        if (!contact) {
            return 0;
        }

        const contactLength =
            getContactSectionLength(
                contact
            );

        if (
            contactLength <= 0
        ) {
            return 0;
        }

        return clamp(
            (
                Number(
                    marker.positionMm
                ) || 0
            ) /
                contactLength,
            0,
            1
        );
    }

    function renderContact(
        contact
    ) {
        const selected =
            selectedContactId ===
            contact.id;

        const start =
            getContactPosition(
                contact
            );

        const length =
            getContactSectionLength(
                contact
            );

        const left =
            clamp(
                start /
                    data.lengthMm,
                0,
                1
            ) *
            100;

        const width =
            clamp(
                length /
                    data.lengthMm,
                0,
                1
            ) *
            100;

        return (
            <div
                key={contact.id}
                className={[
                    "block-editor-contact-section",
                    selected
                        ? "selected"
                        : "",
                ]
                    .filter(Boolean)
                    .join(" ")}
                style={
                    orientation ===
                    BlockGridOrientation.HORIZONTAL
                        ? {
                              left: `${left}%`,
                              width: `${Math.max(
                                  width,
                                  1
                              )}%`,
                          }
                        : {
                              top: `${left}%`,
                              height: `${Math.max(
                                  width,
                                  1
                              )}%`,
                          }
                }
                onClick={(event) => {
                    event.stopPropagation();
                    setSelectedContactId(
                        contact.id
                    );
                    setSelectedMarkerId(
                        null
                    );
                    setSelectedSignalSide(
                        null
                    );
                    setTool(
                        "NONE"
                    );
                }}
                onDoubleClick={(
                    event
                ) => {
                    event.stopPropagation();
                    openContactDialog(
                        contact
                    );
                }}
            >
                <span className="block-editor-contact-label">
                    {contact.contactDetectorName}
                </span>

                <button
                    type="button"
                    className="block-editor-contact-handle start"
                    onPointerDown={(
                        event
                    ) =>
                        startContactDrag(
                            event,
                            contact,
                            "start"
                        )
                    }
                    title="Belegtmelder-Anfang verschieben"
                />

                <button
                    type="button"
                    className="block-editor-contact-handle end"
                    onPointerDown={(
                        event
                    ) =>
                        startContactDrag(
                            event,
                            contact,
                            "end"
                        )
                    }
                    title="Belegtmelder-Ende verschieben"
                />
            </div>
        );
    }

    function renderMarkers(
        direction
    ) {
        const markers =
            (
                data.markers ??
                []
            ).filter(
                (marker) =>
                    marker.direction ===
                        direction ||
                    marker.direction ===
                        BlockDirection.BOTH
            );

        return markers.map(
            (marker) => {
                const contact =
                    occupancyContacts.find(
                        (item) =>
                            item.id ===
                            marker.contactAssignmentId
                    );

                if (!contact) {
                    return null;
                }

                return (
                    <MarkerFlag
                        key={marker.id}
                        marker={marker}
                        contact={
                            contact
                        }
                        blockLength={
                            data.lengthMm
                        }
                        orientation={
                            orientation
                        }
                        selected={
                            selectedMarkerId ===
                            marker.id
                        }
                        onClick={() => {
                            setSelectedMarkerId(
                                marker.id
                            );
                            setSelectedContactId(
                                contact.id
                            );
                            setSelectedSignalSide(
                                null
                            );
                            setTool(
                                "PROPERTIES"
                            );
                        }}
                    />
                );
            }
        );
    }

    function renderSignal(
        side
    ) {
        const signal =
            (
                data.signals ??
                []
            ).find(
                (item) =>
                    item.side ===
                    side
            );

        return (
            <BlockSignal
                side={side}
                signal={
                    signal
                }
                orientation={
                    orientation
                }
                selected={
                    selectedSignalSide ===
                    side
                }
                onClick={() => {
                    setSelectedSignalSide(
                        side
                    );
                    setSelectedMarkerId(
                        null
                    );
                    setSelectedContactId(
                        null
                    );
                    setTool(
                        "PROPERTIES"
                    );
                }}
            />
        );
    }

    const markerToolsDisabled =
        !selectedContact;

    const selectedDetector =
        selectedContact
            ? detectors.find(
                  (detector) =>
                      detector.id ===
                      selectedContact.contactDetectorId
              )
            : null;

    return (
        <div className="block-editor-tab">
            <div className="block-editor-tab-toolbar">
                <label>
                    Ausrichtung im Grid
                    <select
                        value={
                            orientation
                        }
                        onChange={(event) =>
                            void changeOrientation(
                                event
                                    .target
                                    .value
                            )
                        }
                    >
                        <option
                            value={
                                BlockGridOrientation.HORIZONTAL
                            }
                        >
                            Horizontal
                        </option>
                        <option
                            value={
                                BlockGridOrientation.VERTICAL
                            }
                        >
                            Vertikal
                        </option>
                    </select>
                </label>
            </div>

            <div className="block-editor-tab-content">
                <div className="block-editor-preview">
                    <div className="block-editor-preview-title">
                        Blockdarstellung
                    </div>

                    <div
                        className={[
                            "block-editor-preview-area",
                            orientation ===
                            BlockGridOrientation.VERTICAL
                                ? "vertical"
                                : "horizontal",
                        ].join(" ")}
                    >
                        <div className="block-editor-marker-row top">
                            {renderMarkers(
                                BlockDirection.FORWARD
                            )}
                        </div>

                        <div className="block-editor-preview-track">
                            <div className="block-editor-signal-row">
                                {renderSignal(
                                    BlockSignalSide.START
                                )}

                                <div className="block-editor-track">
                                    {occupancyContacts.map(
                                        renderContact
                                    )}
                                </div>

                                {renderSignal(
                                    BlockSignalSide.END
                                )}
                            </div>

                            <div className="block-editor-track-markers">
                                {(
                                    data.markers ??
                                    []
                                ).map(
                                    (
                                        marker
                                    ) => {
                                        const contact =
                                            occupancyContacts.find(
                                                (
                                                    item
                                                ) =>
                                                    item.id ===
                                                    marker.contactAssignmentId
                                            );

                                        if (
                                            !contact
                                        ) {
                                            return null;
                                        }

                                        const position =
                                            getMarkerPosition(
                                                marker,
                                                contact
                                            );

                                        return (
                                            <span
                                                key={
                                                    marker.id
                                                }
                                                className={[
                                                    "block-editor-marker-position",
                                                    selectedMarkerId ===
                                                    marker.id
                                                        ? "selected"
                                                        : "",
                                                ]
                                                    .filter(
                                                        Boolean
                                                    )
                                                    .join(
                                                        " "
                                                    )}
                                                style={{
                                                    [orientation ===
                                                    BlockGridOrientation.HORIZONTAL
                                                        ? "left"
                                                        : "top"]:
                                                        `${(
                                                            (
                                                                getContactPosition(
                                                                    contact
                                                                ) /
                                                                    data.lengthMm
                                                            ) +
                                                            position *
                                                                (
                                                                    getContactSectionLength(
                                                                        contact
                                                                    ) /
                                                                        data.lengthMm
                                                                )
                                                        ) *
                                                            100}%`,
                                                }}
                                            />
                                        );
                                    }
                                )}
                            </div>
                        </div>

                        <div className="block-editor-marker-row bottom">
                            {renderMarkers(
                                BlockDirection.REVERSE
                            )}
                        </div>
                    </div>
                </div>

                <div className="block-editor-tools">
                    <section className="block-editor-section">
                        <h4>Tools</h4>

                        <div className="block-editor-tool-row">
                            <select
                                value={
                                    tool.startsWith(
                                        "NEW_CONTACT"
                                    ) ||
                                    tool ===
                                        "VIRTUAL_CONTACT"
                                        ? tool
                                        : "NONE"
                                }
                                onChange={(
                                    event
                                ) =>
                                    setTool(
                                        event
                                            .target
                                            .value
                                    )
                                }
                            >
                                <option value="NONE">
                                    Werkzeug wählen
                                </option>
                                <option value="NEW_CONTACT">
                                    Neuer Kontakt
                                </option>
                                <option value="VIRTUAL_CONTACT">
                                    Neuer virtueller Kontakt
                                </option>
                            </select>

                            <button
                                type="button"
                                className={
                                    tool ===
                                    "PROPERTIES"
                                        ? "active"
                                        : ""
                                }
                                disabled={
                                    !selectedMarker &&
                                    !selectedContact &&
                                    !selectedSignalSide
                                }
                                onClick={() =>
                                    setTool(
                                        "PROPERTIES"
                                    )
                                }
                            >
                                Eigenschaften
                            </button>

                            <button
                                type="button"
                                className="danger"
                                disabled={
                                    !selectedMarker &&
                                    !selectedContact &&
                                    !selectedSignalSide
                                }
                                onClick={() =>
                                    void removeSelected()
                                }
                            >
                                X
                            </button>
                        </div>

                        <div className="block-editor-tool-arrow-row">
                            <button
                                type="button"
                                disabled={
                                    markerToolsDisabled
                                }
                                className="marker-stop"
                                onClick={() =>
                                    void createMarker(
                                        BlockMarkerType.STOP,
                                        BlockDirection.FORWARD
                                    )
                                }
                            >
                                ← Haltemarkierung
                            </button>

                            <button
                                type="button"
                                disabled={
                                    markerToolsDisabled
                                }
                                className="marker-brake"
                                onClick={() =>
                                    void createMarker(
                                        BlockMarkerType.BRAKE,
                                        BlockDirection.FORWARD
                                    )
                                }
                            >
                                ← Bremsmarkierung
                            </button>

                            <button
                                type="button"
                                disabled={
                                    markerToolsDisabled
                                }
                                className="marker-speed"
                                onClick={() =>
                                    void createMarker(
                                        BlockMarkerType.SPEED,
                                        BlockDirection.FORWARD
                                    )
                                }
                            >
                                ← Geschwindigkeitsmarkierung
                            </button>
                        </div>

                        <div className="block-editor-tool-arrow-row">
                            <button
                                type="button"
                                disabled={
                                    markerToolsDisabled
                                }
                                className="marker-stop"
                                onClick={() =>
                                    void createMarker(
                                        BlockMarkerType.STOP,
                                        BlockDirection.REVERSE
                                    )
                                }
                            >
                                → Haltemarkierung
                            </button>

                            <button
                                type="button"
                                disabled={
                                    markerToolsDisabled
                                }
                                className="marker-brake"
                                onClick={() =>
                                    void createMarker(
                                        BlockMarkerType.BRAKE,
                                        BlockDirection.REVERSE
                                    )
                                }
                            >
                                → Bremsmarkierung
                            </button>

                            <button
                                type="button"
                                disabled={
                                    markerToolsDisabled
                                }
                                className="marker-speed"
                                onClick={() =>
                                    void createMarker(
                                        BlockMarkerType.SPEED,
                                        BlockDirection.REVERSE
                                    )
                                }
                            >
                                → Geschwindigkeitsmarkierung
                            </button>
                        </div>

                        {!selectedContact && (
                            <div className="block-editor-hint">
                                Wähle zuerst einen roten Belegtmeldeabschnitt aus.
                                Erst dann können Markierungen angelegt werden.
                            </div>
                        )}
                    </section>

                    <section
                        className={[
                            "block-editor-section",
                            !selectedMarker
                                ? "disabled"
                                : "",
                        ].join(" ")}
                    >
                        <h4>
                            Markierungen
                        </h4>

                        {!selectedMarker && (
                            <div className="block-editor-disabled-hint">
                                Keine Markierung ausgewählt.
                            </div>
                        )}

                        {selectedMarker && (
                            <>
                                <label>
                                    Distanz
                                    <div className="block-editor-unit-input">
                                        <input
                                            type="number"
                                            min="0"
                                            value={
                                                selectedMarker.positionMm ??
                                                0
                                            }
                                            onChange={(
                                                event
                                            ) =>
                                                void updateMarker(
                                                    selectedMarker,
                                                    {
                                                        positionMm:
                                                            event
                                                                .target
                                                                .value,
                                                    }
                                                )
                                            }
                                        />
                                        <span>
                                            mm
                                        </span>
                                    </div>
                                </label>

                                <label>
                                    Rampe
                                    <div className="block-editor-unit-input">
                                        <input
                                            type="number"
                                            min="0"
                                            disabled={
                                                selectedMarker.type ===
                                                BlockMarkerType.STOP
                                            }
                                            value={
                                                selectedMarker.type ===
                                                BlockMarkerType.STOP
                                                    ? ""
                                                    : selectedMarker.lengthMm ??
                                                      0
                                            }
                                            onChange={(
                                                event
                                            ) =>
                                                void updateMarker(
                                                    selectedMarker,
                                                    {
                                                        lengthMm:
                                                            event
                                                                .target
                                                                .value,
                                                    }
                                                )
                                            }
                                        />
                                        <span>
                                            mm
                                        </span>
                                    </div>
                                </label>

                                <label>
                                    Zugposition
                                    <select
                                        value={
                                            selectedMarker.trainPosition ??
                                            BlockMarkerTrainPosition.FRONT
                                        }
                                        onChange={(
                                            event
                                        ) =>
                                            void updateMarker(
                                                selectedMarker,
                                                {
                                                    trainPosition:
                                                        event
                                                            .target
                                                            .value,
                                                }
                                            )
                                        }
                                    >
                                        <option
                                            value={
                                                BlockMarkerTrainPosition.FRONT
                                            }
                                        >
                                            Zugspitze
                                        </option>
                                        <option
                                            value={
                                                BlockMarkerTrainPosition.MIDDLE
                                            }
                                        >
                                            Zugmitte
                                        </option>
                                        <option
                                            value={
                                                BlockMarkerTrainPosition.END
                                            }
                                        >
                                            Zugende
                                        </option>
                                        <option
                                            value={
                                                BlockMarkerTrainPosition.FORMULA
                                            }
                                        >
                                            Formel
                                        </option>
                                    </select>
                                </label>

                                <label className="block-editor-checkbox">
                                    <input
                                        type="checkbox"
                                        checked={
                                            selectedMarker.scheduledStop ??
                                            false
                                        }
                                        onChange={(
                                            event
                                        ) =>
                                            void updateMarker(
                                                selectedMarker,
                                                {
                                                    scheduledStop:
                                                        event
                                                            .target
                                                            .checked,
                                                }
                                            )
                                        }
                                    />
                                    Nur planmäßiger Halt
                                </label>

                                <div className="block-editor-selected-info">
                                    {markerLabel(
                                        selectedMarker.type
                                    )}
                                    {" · "}
                                    {getMarkerDirectionLabel(
                                        selectedMarker.direction
                                    )}
                                    {" · "}
                                    {selectedDetector?.name ??
                                        "Belegtmelder"}
                                </div>
                            </>
                        )}
                    </section>

                    <section
                        className={[
                            "block-editor-section",
                            !selectedSignalSide
                                ? "disabled"
                                : "",
                        ].join(" ")}
                    >
                        <h4>
                            Blocksignal
                        </h4>

                        {!selectedSignalSide && (
                            <div className="block-editor-disabled-hint">
                                Wähle ein Blocksignal am Anfang oder Ende des Blocks.
                            </div>
                        )}

                        {selectedSignalSide && (
                            <label>
                                Signaltyp
                                <select
                                    value={
                                        selectedSignal?.signalType ??
                                        BlockSignalType.NONE
                                    }
                                    onChange={(
                                        event
                                    ) =>
                                        void updateSignal(
                                            selectedSignalSide,
                                            event
                                                .target
                                                .value
                                        )
                                    }
                                >
                                    <option
                                        value={
                                            BlockSignalType.NONE
                                        }
                                    >
                                        Keins
                                    </option>
                                    <option
                                        value={
                                            BlockSignalType.TWO_ASPECT
                                        }
                                    >
                                        Zweibegriffig
                                    </option>
                                    <option
                                        value={
                                            BlockSignalType.THREE_ASPECT
                                        }
                                    >
                                        Dreibegriffig
                                    </option>
                                    <option
                                        value={
                                            BlockSignalType.FOUR_ASPECT
                                        }
                                    >
                                        Vierbegriffig
                                    </option>
                                </select>
                            </label>
                        )}
                    </section>
                </div>
            </div>
        </div>
    );
}
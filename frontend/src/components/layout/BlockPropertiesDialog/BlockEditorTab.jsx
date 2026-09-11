import {
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react";

import {
    apiFetch,
} from "../../../api/apiClient";

import {
    createContactDetector,
    getContactDetectors,
    assignContactDetector,
    deleteContactAssignment,
} from "../../../api/blockApi";

import {
    createBlockEditorMarker,
    updateBlockEditorMarker,
    deleteBlockEditorMarker,
    updateBlockEditorContact,
    updateBlockEditorSignal,
} from "../../../api/blockEditorApi";

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

const markerColors = {
    STOP: "#d73535",
    BRAKE: "#d7b400",
    SPEED: "#36a852",
    ENTRY: "#36a852",
    EXIT: "#36a852",
};

function clamp(
    value,
    min,
    max
) {
    return Math.min(
        max,
        Math.max(
            min,
            value
        )
    );
}

function markerLabel(
    type
) {
    switch (type) {
        case BlockMarkerType.STOP:
            return "Haltemarkierung";

        case BlockMarkerType.BRAKE:
            return "Bremsmarkierung";

        case BlockMarkerType.SPEED:
            return "Geschwindigkeitsmarkierung";

        case BlockMarkerType.ENTRY:
            return "Eintrittsmarkierung";

        case BlockMarkerType.EXIT:
            return "Austrittsmarkierung";

        default:
            return type;
    }
}

export default function BlockEditorTab({
    layoutId,
    blockId,
    data,
    onDataChanged,
}) {
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

    const [
        newContactName,
        setNewContactName,
    ] = useState("");

    const [
        newContactSystem,
        setNewContactSystem,
    ] = useState("");

    const [
        newContactAddress,
        setNewContactAddress,
    ] = useState("");

    const [
        error,
        setError,
    ] = useState(null);

    const propertiesRef =
        useRef(null);

    const dragRef =
        useRef(null);

    const selectedMarker =
        data?.markers?.find(
            (marker) =>
                marker.id ===
                selectedMarkerId
        ) ?? null;

    const selectedContact =
        data?.contacts?.find(
            (contact) =>
                contact.id ===
                selectedContactId
        ) ?? null;

    const selectedSignal =
        data?.signals?.find(
            (signal) =>
                signal.side ===
                selectedSignalSide
        ) ?? null;

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
                    loadedDetectors ??
                        []
                );

                setDigitalSystems(
                    systems ??
                        []
                );
            } catch (exception) {
                console.error(
                    "Kontaktdaten konnten nicht geladen werden:",
                    exception
                );
            }
        }

        loadAuxiliaryData();

        return () => {
            active = false;
        };
    }, [
        layoutId,
    ]);

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
    }, [
        data?.id,
    ]);

    function updateData(
        patch
    ) {
        if (
            onDataChanged
        ) {
            onDataChanged({
                ...data,
                ...patch,
            });
        }
    }

    async function changeOrientation(
        value
    ) {
        setOrientation(
            value
        );

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

            updateData(
                updated
            );
        } catch (exception) {
            console.error(
                "Ausrichtung konnte nicht gespeichert werden:",
                exception
            );

            setError(
                "Die Ausrichtung konnte nicht gespeichert werden."
            );
        }
    }

    async function createMarker(
        type,
        direction
    ) {
        try {
            const marker =
                await createBlockEditorMarker(
                    layoutId,
                    blockId,
                    {
                        type,
                        positionMm:
                            Math.round(
                                data.lengthMm /
                                    2
                            ),
                        lengthMm: 100,
                        direction,
                        trainPosition:
                            BlockMarkerTrainPosition.FRONT,
                        scheduledStop:
                            type ===
                            BlockMarkerType.STOP,
                    }
                );

            updateData({
                markers: [
                    ...(data.markers ??
                        []),
                    marker,
                ],
            });

            setSelectedMarkerId(
                marker.id
            );

            setSelectedContactId(
                null
            );

            setSelectedSignalSide(
                null
            );
        } catch (exception) {
            console.error(
                "Markierung konnte nicht angelegt werden:",
                exception
            );

            setError(
                "Die Markierung konnte nicht angelegt werden."
            );
        }
    }

    async function updateMarker(
        marker,
        patch
    ) {
        try {
            const updated =
                await updateBlockEditorMarker(
                    layoutId,
                    marker.id,
                    {
                        type:
                            patch.type ??
                            marker.type,
                        positionMm:
                            patch.positionMm ??
                            marker.positionMm,
                        lengthMm:
                            patch.lengthMm ??
                            marker.lengthMm,
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
                    data.markers.map(
                        (item) =>
                            item.id ===
                            updated.id
                                ? updated
                                : item
                    ),
            });
        } catch (exception) {
            console.error(
                "Markierung konnte nicht aktualisiert werden:",
                exception
            );

            setError(
                "Die Markierung konnte nicht gespeichert werden."
            );
        }
    }

    async function removeSelected() {
        if (
            selectedMarker
        ) {
            try {
                await deleteBlockEditorMarker(
                    layoutId,
                    selectedMarker.id
                );

                updateData({
                    markers:
                        data.markers.filter(
                            (marker) =>
                                marker.id !==
                                selectedMarker.id
                        ),
                });

                setSelectedMarkerId(
                    null
                );
            } catch (exception) {
                console.error(
                    "Markierung konnte nicht gelöscht werden:",
                    exception
                );
            }

            return;
        }

        if (
            selectedContact
        ) {
            try {
                await deleteContactAssignment(
                    layoutId,
                    selectedContact.id
                );

                updateData({
                    contacts:
                        data.contacts.filter(
                            (contact) =>
                                contact.id !==
                                selectedContact.id
                        ),
                });

                setSelectedContactId(
                    null
                );
            } catch (exception) {
                console.error(
                    "Kontaktzuordnung konnte nicht gelöscht werden:",
                    exception
                );
            }

            return;
        }

        if (
            selectedSignalSide
        ) {
            try {
                const signal =
                    await updateBlockEditorSignal(
                        layoutId,
                        blockId,
                        selectedSignalSide,
                        BlockSignalType.NONE
                    );

                updateData({
                    signals:
                        data.signals.map(
                            (item) =>
                                item.side ===
                                signal.side
                                    ? signal
                                    : item
                        ),
                });
            } catch (exception) {
                console.error(
                    "Blocksignal konnte nicht entfernt werden:",
                    exception
                );
            }
        }
    }

    async function updateContact(
        contact,
        positionMm,
        lengthMm
    ) {
        const safePosition =
            clamp(
                Number(
                    positionMm
                ),
                0,
                data.lengthMm
            );

        const safeLength =
            clamp(
                Number(
                    lengthMm
                ),
                1,
                Math.max(
                    1,
                    data.lengthMm -
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
                    data.contacts.map(
                        (item) =>
                            item.id ===
                            updated.id
                                ? updated
                                : item
                    ),
            });
        } catch (exception) {
            console.error(
                "Belegtmelder konnte nicht geändert werden:",
                exception
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
                    data.signals.map(
                        (item) =>
                            item.side ===
                            side
                                ? signal
                                : item
                    ),
            });
        } catch (exception) {
            console.error(
                "Blocksignal konnte nicht gespeichert werden:",
                exception
            );
        }
    }

    async function createContactAtPosition(
        positionMm
    ) {
        const virtual =
            tool ===
            "VIRTUAL_CONTACT";

        if (
            tool !==
                "NEW_CONTACT" &&
            !virtual
        ) {
            return;
        }

        if (
            !newContactName.trim()
        ) {
            setError(
                "Bitte einen Namen für den Kontakt eingeben."
            );
            return;
        }

        if (
            !virtual &&
            !newContactSystem
        ) {
            setError(
                "Bitte ein Digitalsystem auswählen."
            );
            return;
        }

        if (
            !virtual &&
            (
                !Number.isInteger(
                    Number(
                        newContactAddress
                    )
                ) ||
                Number(
                    newContactAddress
                ) < 1
            )
        ) {
            setError(
                "Bitte eine gültige Adresse eingeben."
            );
            return;
        }

        try {
            const detector =
                await createContactDetector(
                    layoutId,
                    {
                        name:
                            newContactName.trim(),
                        type:
                            virtual
                                ? ContactDetectorType.VIRTUAL
                                : ContactDetectorType.PHYSICAL,
                        digitalSystemId:
                            virtual
                                ? null
                                : newContactSystem,
                        digitalAddress:
                            virtual
                                ? null
                                : Number(
                                      newContactAddress
                                  ),
                    }
                );

            const assignment =
                await assignContactDetector(
                    layoutId,
                    blockId,
                    {
                        contactDetectorId:
                            detector.id,
                        role:
                            BlockContactRole.OCCUPANCY,
                        positionMm,
                    }
                );

            updateData({
                contacts: [
                    ...(data.contacts ??
                        []),
                    {
                        ...assignment,
                        lengthMm:
                            Math.max(
                                100,
                                Math.round(
                                    data.lengthMm /
                                        4
                                )
                            ),
                    },
                ],
            });

            setDetectors(
                (current) => [
                    ...current,
                    detector,
                ]
            );

            setNewContactName(
                ""
            );
            setNewContactAddress(
                ""
            );
            setError(null);

            setSelectedContactId(
                assignment.id
            );
        } catch (exception) {
            console.error(
                "Kontakt konnte nicht angelegt werden:",
                exception
            );

            setError(
                "Der Kontakt konnte nicht angelegt werden."
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
                    data.lengthMm
            ),
            0,
            data.lengthMm
        );
    }

    function handleCanvasClick(
        event
    ) {
        if (
            tool ===
                "NEW_STOP_LEFT" ||
            tool ===
                "NEW_BRAKE_LEFT" ||
            tool ===
                "NEW_SPEED_LEFT"
        ) {
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
            tool ===
                "NEW_STOP_RIGHT" ||
            tool ===
                "NEW_BRAKE_RIGHT" ||
            tool ===
                "NEW_SPEED_RIGHT"
        ) {
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
            tool === "NEW_CONTACT" ||
            tool === "VIRTUAL_CONTACT"
        ) {
            void createContactAtPosition(
                getPositionFromPointer(
                    event
                )
            );
        }
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
        if (
            !dragRef.current
        ) {
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
                        data.lengthMm
                ),
                0,
                data.lengthMm
            );

        const contact =
            data.contacts.find(
                (item) =>
                    item.id ===
                    dragRef.current.contactId
            );

        if (!contact) {
            return;
        }

        if (
            dragRef.current.edge ===
            "start"
        ) {
            const end =
                (
                    contact.positionMm ??
                    0
                ) +
                contact.lengthMm;

            const newStart =
                clamp(
                    position,
                    0,
                    end - 1
                );

            updateData({
                contacts:
                    data.contacts.map(
                        (item) =>
                            item.id ===
                            contact.id
                                ? {
                                      ...item,
                                      positionMm:
                                          newStart,
                                      lengthMm:
                                          end -
                                          newStart,
                                  }
                                : item
                    ),
            });

            return;
        }

        const start =
            contact.positionMm ??
            0;

        const newEnd =
            clamp(
                position,
                start + 1,
                data.lengthMm
            );

        updateData({
            contacts:
                data.contacts.map(
                    (item) =>
                        item.id ===
                        contact.id
                            ? {
                                  ...item,
                                  lengthMm:
                                      newEnd -
                                      start,
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

        const contact =
            data.contacts.find(
                (item) =>
                    item.id ===
                    dragRef.current?.contactId
            );

        if (contact) {
            void updateContact(
                contact,
                contact.positionMm ??
                    0,
                contact.lengthMm
            );
        }

        dragRef.current =
            null;
    }

    function focusProperties() {
        propertiesRef.current?.scrollIntoView({
            behavior: "smooth",
            block: "nearest",
        });
    }

    const selectedContactDetector =
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
                                event.target
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
                        className={
                            `block-editor-preview-area ${
                                orientation ===
                                BlockGridOrientation.VERTICAL
                                    ? "vertical"
                                    : "horizontal"
                            }`
                        }
                    >
                        <div
                            className="block-editor-preview-track"
                            onClick={
                                handleCanvasClick
                            }
                        >
                            {orientation ===
                            BlockGridOrientation.HORIZONTAL ? (
                                <>
                                    <div className="block-editor-marker-row top">
                                        {data.markers
                                            ?.filter(
                                                (
                                                    marker
                                                ) =>
                                                    marker.direction ===
                                                        BlockDirection.FORWARD ||
                                                    marker.direction ===
                                                        BlockDirection.BOTH
                                            )
                                            .map(
                                                (
                                                    marker
                                                ) => (
                                                    <MarkerFlag
                                                        key={
                                                            marker.id
                                                        }
                                                        marker={
                                                            marker
                                                        }
                                                        length={
                                                            data.lengthMm
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
                                                                null
                                                            );
                                                            setSelectedSignalSide(
                                                                null
                                                            );
                                                        }}
                                                    />
                                                )
                                            )}
                                    </div>

                                    <BlockTrack
                                        data={
                                            data
                                        }
                                        selectedContactId={
                                            selectedContactId
                                        }
                                        selectedSignalSide={
                                            selectedSignalSide
                                        }
                                        onContactClick={(
                                            contact
                                        ) => {
                                            setSelectedContactId(
                                                contact.id
                                            );
                                            setSelectedMarkerId(
                                                null
                                            );
                                            setSelectedSignalSide(
                                                null
                                            );
                                        }}
                                        onSignalClick={(
                                            side
                                        ) => {
                                            setSelectedSignalSide(
                                                side
                                            );
                                            setSelectedMarkerId(
                                                null
                                            );
                                            setSelectedContactId(
                                                null
                                            );
                                        }}
                                        onContactHandleDown={
                                            startContactDrag
                                        }
                                    />

                                    <div className="block-editor-marker-row bottom">
                                        {data.markers
                                            ?.filter(
                                                (
                                                    marker
                                                ) =>
                                                    marker.direction ===
                                                        BlockDirection.REVERSE ||
                                                    marker.direction ===
                                                        BlockDirection.BOTH
                                            )
                                            .map(
                                                (
                                                    marker
                                                ) => (
                                                    <MarkerFlag
                                                        key={
                                                            marker.id
                                                        }
                                                        marker={
                                                            marker
                                                        }
                                                        length={
                                                            data.lengthMm
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
                                                                null
                                                            );
                                                            setSelectedSignalSide(
                                                                null
                                                            );
                                                        }}
                                                    />
                                                )
                                            )}
                                    </div>
                                </>
                            ) : (
                                <div className="block-editor-vertical-wrapper">
                                    <BlockTrack
                                        data={
                                            data
                                        }
                                        selectedContactId={
                                            selectedContactId
                                        }
                                        selectedSignalSide={
                                            selectedSignalSide
                                        }
                                        onContactClick={(
                                            contact
                                        ) => {
                                            setSelectedContactId(
                                                contact.id
                                            );
                                            setSelectedMarkerId(
                                                null
                                            );
                                            setSelectedSignalSide(
                                                null
                                            );
                                        }}
                                        onSignalClick={(
                                            side
                                        ) => {
                                            setSelectedSignalSide(
                                                side
                                            );
                                            setSelectedMarkerId(
                                                null
                                            );
                                            setSelectedContactId(
                                                null
                                            );
                                        }}
                                        onContactHandleDown={
                                            startContactDrag
                                        }
                                    />
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="block-editor-preview-help">
                        Markierungen und Blocksignale anklicken.
                        Belegtmelder können an den roten Griffen
                        verlängert bzw. verkürzt werden.
                    </div>
                </div>

                <div
                    className="block-editor-tools"
                    ref={propertiesRef}
                >
                    <section className="block-editor-section">
                        <h4>Tools</h4>

                        <div className="block-editor-tool-row">
                            <select
                                value={
                                    tool
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
                                    Neuer Kontakt
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
                                onClick={
                                    focusProperties
                                }
                                disabled={
                                    !selectedMarker &&
                                    !selectedContact &&
                                    !selectedSignal
                                }
                            >
                                Eigenschaften
                            </button>

                            <button
                                type="button"
                                className="block-editor-delete-button"
                                onClick={() =>
                                    void removeSelected()
                                }
                                disabled={
                                    !selectedMarker &&
                                    !selectedContact &&
                                    !selectedSignal
                                }
                            >
                                X
                            </button>
                        </div>

                        {(
                            tool ===
                                "NEW_CONTACT" ||
                            tool ===
                                "VIRTUAL_CONTACT"
                        ) && (
                            <div className="block-editor-contact-create">
                                <input
                                    type="text"
                                    placeholder="Kontaktname"
                                    value={
                                        newContactName
                                    }
                                    onChange={(
                                        event
                                    ) =>
                                        setNewContactName(
                                            event
                                                .target
                                                .value
                                        )
                                    }
                                />

                                {tool ===
                                    "NEW_CONTACT" && (
                                    <>
                                        <select
                                            value={
                                                newContactSystem
                                            }
                                            onChange={(
                                                event
                                            ) =>
                                                setNewContactSystem(
                                                    event
                                                        .target
                                                        .value
                                                )
                                            }
                                        >
                                            <option value="">
                                                Digitalsystem
                                            </option>

                                            {digitalSystems.map(
                                                (
                                                    system
                                                ) => (
                                                    <option
                                                        key={
                                                            system.id
                                                        }
                                                        value={
                                                            system.id
                                                        }
                                                    >
                                                        {
                                                            system.name
                                                        }
                                                    </option>
                                                )
                                            )}
                                        </select>

                                        <input
                                            type="number"
                                            min="1"
                                            placeholder="Adresse"
                                            value={
                                                newContactAddress
                                            }
                                            onChange={(
                                                event
                                            ) =>
                                                setNewContactAddress(
                                                    event
                                                        .target
                                                        .value
                                                )
                                            }
                                        />
                                    </>
                                )}

                                <div className="block-editor-contact-hint">
                                    Anschließend auf die
                                    gewünschte Position im
                                    Block klicken.
                                </div>
                            </div>
                        )}

                        <div className="block-editor-tool-row marker-tools">
                            <button
                                type="button"
                                className="marker-stop"
                                onClick={() =>
                                    setTool(
                                        "NEW_STOP_LEFT"
                                    )
                                }
                            >
                                ← Halt
                            </button>

                            <button
                                type="button"
                                className="marker-brake"
                                onClick={() =>
                                    setTool(
                                        "NEW_BRAKE_LEFT"
                                    )
                                }
                            >
                                ← Bremse
                            </button>

                            <button
                                type="button"
                                className="marker-speed"
                                onClick={() =>
                                    setTool(
                                        "NEW_SPEED_LEFT"
                                    )
                                }
                            >
                                ← Tempo
                            </button>
                        </div>

                        <div className="block-editor-tool-row marker-tools">
                            <button
                                type="button"
                                className="marker-stop"
                                onClick={() =>
                                    setTool(
                                        "NEW_STOP_RIGHT"
                                    )
                                }
                            >
                                Halt →
                            </button>

                            <button
                                type="button"
                                className="marker-brake"
                                onClick={() =>
                                    setTool(
                                        "NEW_BRAKE_RIGHT"
                                    )
                                }
                            >
                                Bremse →
                            </button>

                            <button
                                type="button"
                                className="marker-speed"
                                onClick={() =>
                                    setTool(
                                        "NEW_SPEED_RIGHT"
                                    )
                                }
                            >
                                Tempo →
                            </button>
                        </div>
                    </section>

                    <section
                        className={
                            `block-editor-section ${
                                selectedMarker
                                    ? ""
                                    : "disabled"
                            }`
                        }
                    >
                        <h4>
                            Markierungen
                        </h4>

                        <label>
                            Distanz
                            <div className="block-editor-unit-input">
                                <input
                                    type="number"
                                    min="0"
                                    value={
                                        selectedMarker
                                            ?.positionMm ??
                                        ""
                                    }
                                    disabled={
                                        !selectedMarker
                                    }
                                    onChange={(
                                        event
                                    ) =>
                                        selectedMarker &&
                                        void updateMarker(
                                            selectedMarker,
                                            {
                                                positionMm:
                                                    Number(
                                                        event
                                                            .target
                                                            .value
                                                    ),
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
                                    min="1"
                                    value={
                                        selectedMarker
                                            ?.lengthMm ??
                                        ""
                                    }
                                    disabled={
                                        !selectedMarker
                                    }
                                    onChange={(
                                        event
                                    ) =>
                                        selectedMarker &&
                                        void updateMarker(
                                            selectedMarker,
                                            {
                                                lengthMm:
                                                    Number(
                                                        event
                                                            .target
                                                            .value
                                                    ),
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
                                disabled={
                                    !selectedMarker
                                }
                                value={
                                    selectedMarker
                                        ?.trainPosition ??
                                    BlockMarkerTrainPosition.FRONT
                                }
                                onChange={(
                                    event
                                ) =>
                                    selectedMarker &&
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
                                <option value="FRONT">
                                    Zugspitze
                                </option>
                                <option value="MIDDLE">
                                    Zugmitte
                                </option>
                                <option value="END">
                                    Zugende
                                </option>
                                <option value="FORMULA">
                                    Formel
                                </option>
                            </select>
                        </label>

                        <label className="block-editor-checkbox">
                            <input
                                type="checkbox"
                                checked={
                                    selectedMarker
                                        ?.scheduledStop ??
                                    false
                                }
                                disabled={
                                    !selectedMarker
                                }
                                onChange={(
                                    event
                                ) =>
                                    selectedMarker &&
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

                        {selectedMarker && (
                            <div className="block-editor-selection-info">
                                {markerLabel(
                                    selectedMarker.type
                                )}
                            </div>
                        )}
                    </section>

                    <section
                        className={
                            `block-editor-section ${
                                selectedSignal
                                    ? ""
                                    : "disabled"
                            }`
                        }
                    >
                        <h4>
                            Blocksignal
                        </h4>

                        <label>
                            Signaltyp
                            <select
                                disabled={
                                    !selectedSignal
                                }
                                value={
                                    selectedSignal
                                        ?.signalType ??
                                    BlockSignalType.NONE
                                }
                                onChange={(
                                    event
                                ) =>
                                    selectedSignalSide &&
                                    void updateSignal(
                                        selectedSignalSide,
                                        event
                                            .target
                                            .value
                                    )
                                }
                            >
                                <option value="NONE">
                                    Keins
                                </option>
                                <option value="TWO_ASPECT">
                                    Zweibegriffig
                                </option>
                                <option value="THREE_ASPECT">
                                    Dreibegriffig
                                </option>
                                <option value="FOUR_ASPECT">
                                    Vierbegriffig
                                </option>
                            </select>
                        </label>

                        {selectedSignal && (
                            <div className="block-editor-selection-info">
                                Ende:{" "}
                                {selectedSignal.side ===
                                BlockSignalSide.START
                                    ? "Start"
                                    : "Ende"}
                            </div>
                        )}
                    </section>

                    <section
                        className={
                            `block-editor-section ${
                                selectedContact
                                    ? ""
                                    : "disabled"
                            }`
                        }
                    >
                        <h4>
                            Belegtmelder
                        </h4>

                        <label>
                            Position
                            <div className="block-editor-unit-input">
                                <input
                                    type="number"
                                    min="0"
                                    value={
                                        selectedContact
                                            ?.positionMm ??
                                        ""
                                    }
                                    disabled={
                                        !selectedContact
                                    }
                                    onChange={(
                                        event
                                    ) =>
                                        selectedContact &&
                                        void updateContact(
                                            selectedContact,
                                            Number(
                                                event
                                                    .target
                                                    .value
                                            ),
                                            selectedContact.lengthMm
                                        )
                                    }
                                />
                                <span>
                                    mm
                                </span>
                            </div>
                        </label>

                        <label>
                            Länge
                            <div className="block-editor-unit-input">
                                <input
                                    type="number"
                                    min="1"
                                    value={
                                        selectedContact
                                            ?.lengthMm ??
                                        ""
                                    }
                                    disabled={
                                        !selectedContact
                                    }
                                    onChange={(
                                        event
                                    ) =>
                                        selectedContact &&
                                        void updateContact(
                                            selectedContact,
                                            selectedContact.positionMm ??
                                                0,
                                            Number(
                                                event
                                                    .target
                                                    .value
                                            )
                                        )
                                    }
                                />
                                <span>
                                    mm
                                </span>
                            </div>
                        </label>

                        {selectedContact && (
                            <div className="block-editor-selection-info">
                                {selectedContactDetector?.name ??
                                    selectedContact.contactDetectorName}
                            </div>
                        )}
                    </section>

                    {error && (
                        <div className="block-editor-error">
                            {error}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

function MarkerFlag({
    marker,
    length,
    selected,
    onClick,
}) {
    const left =
        `${(
            marker.positionMm /
            Math.max(
                1,
                length
            )
        ) * 100}%`;

    return (
        <button
            type="button"
            className={
                `block-editor-marker-flag ${
                    selected
                        ? "selected"
                        : ""
                }`
            }
            style={{
                left,
                "--marker-color":
                    markerColors[
                        marker.type
                    ] ??
                    "#777777",
            }}
            onClick={(
                event
            ) => {
                event.stopPropagation();
                onClick();
            }}
        >
            <span className="marker-flag-pole" />
            <span className="marker-flag-label">
                {marker.lengthMm}
                {" mm / "}
                {marker.type ===
                BlockMarkerType.STOP
                    ? "H"
                    : marker.type ===
                        BlockMarkerType.BRAKE
                      ? "B"
                      : "G"}
            </span>
        </button>
    );
}

function BlockTrack({
    data,
    selectedContactId,
    selectedSignalSide,
    onContactClick,
    onSignalClick,
    onContactHandleDown,
}) {
    return (
        <div className="block-editor-track">
            <button
                type="button"
                className={
                    `block-editor-signal ${
                        selectedSignalSide ===
                        BlockSignalSide.START
                            ? "selected"
                            : ""
                    }`
                }
                onClick={(
                    event
                ) => {
                    event.stopPropagation();
                    onSignalClick(
                        BlockSignalSide.START
                    );
                }}
            >
                <span className="signal-head">
                    {signalShortName(
                        data.signals?.find(
                            (signal) =>
                                signal.side ===
                                BlockSignalSide.START
                        )?.signalType
                    )}
                </span>
            </button>

            <div className="block-editor-track-body">
                {(
                    data.contacts ??
                    []
                )
                    .filter(
                        (contact) =>
                            contact.role ===
                            BlockContactRole.OCCUPANCY
                    )
                    .map(
                        (
                            contact
                        ) => (
                            <ContactSection
                                key={
                                    contact.id
                                }
                                contact={
                                    contact
                                }
                                length={
                                    data.lengthMm
                                }
                                selected={
                                    selectedContactId ===
                                    contact.id
                                }
                                onClick={() =>
                                    onContactClick(
                                        contact
                                    )
                                }
                                onHandleDown={
                                    onContactHandleDown
                                }
                            />
                        )
                    )}

                <div className="block-editor-track-rail" />

                {(
                    data.markers ??
                    []
                ).map(
                    (marker) => (
                        <div
                            key={
                                marker.id
                            }
                            className="block-editor-hidden-marker-anchor"
                            style={{
                                left:
                                    `${
                                        (
                                            marker.positionMm /
                                            Math.max(
                                                1,
                                                data.lengthMm
                                            )
                                        ) *
                                        100
                                    }%`,
                            }}
                        />
                    )
                )}
            </div>

            <button
                type="button"
                className={
                    `block-editor-signal ${
                        selectedSignalSide ===
                        BlockSignalSide.END
                            ? "selected"
                            : ""
                    }`
                }
                onClick={(
                    event
                ) => {
                    event.stopPropagation();
                    onSignalClick(
                        BlockSignalSide.END
                    );
                }}
            >
                <span className="signal-head">
                    {signalShortName(
                        data.signals?.find(
                            (signal) =>
                                signal.side ===
                                BlockSignalSide.END
                        )?.signalType
                    )}
                </span>
            </button>
        </div>
    );
}

function ContactSection({
    contact,
    length,
    selected,
    onClick,
    onHandleDown,
}) {
    const start =
        (
            (
                contact.positionMm ??
                0
            ) /
            Math.max(
                1,
                length
            )
        ) *
        100;

    const width =
        (
            contact.lengthMm /
            Math.max(
                1,
                length
            )
        ) *
        100;

    return (
        <button
            type="button"
            className={
                `block-editor-contact-section ${
                    selected
                        ? "selected"
                        : ""
                }`
            }
            style={{
                left:
                    `${start}%`,
                width:
                    `${width}%`,
            }}
            onClick={(
                event
            ) => {
                event.stopPropagation();
                onClick();
            }}
        >
            <span
                className="contact-handle"
                onPointerDown={(
                    event
                ) =>
                    onHandleDown(
                        event,
                        contact,
                        "start"
                    )
                }
            />

            <span className="contact-name">
                {contact.contactDetectorName}
            </span>

            <span
                className="contact-handle"
                onPointerDown={(
                    event
                ) =>
                    onHandleDown(
                        event,
                        contact,
                        "end"
                    )
                }
            />
        </button>
    );
}

function signalShortName(
    type
) {
    switch (type) {
        case BlockSignalType.TWO_ASPECT:
            return "2";

        case BlockSignalType.THREE_ASPECT:
            return "3";

        case BlockSignalType.FOUR_ASPECT:
            return "4";

        default:
            return "–";
    }
}
import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  createPortal,
} from "react-dom";

import {
  Tool,
} from "../../models/layout";

import {
  BlockContactRole,
  BlockDirection,
  BlockMarkerType,
  ContactDetectorType,
} from "../../models/block";

import {
  addBlockMarker,
  assignContactDetector,
  createBlock,
  createContactDetector,
  deleteBlock,
  deleteBlockMarker,
  deleteContactAssignment,
  deleteContactDetector,
  getBlocks,
  getContactDetectors,
} from "../../api/blockApi";

import {
  apiFetch,
} from "../../api/apiClient";

import "./BlockEditor.css";

const CELL_SIZE = 40;

function uniqueCells(
  cells
) {
  const result = [];
  const seen = new Set();

  for (const cell of cells) {
    const key =
      `${cell.x}:${cell.y}`;

    if (seen.has(key)) {
      continue;
    }

    seen.add(key);
    result.push(cell);
  }

  return result;
}

function cellsBetween(
  first,
  second
) {
  const dx =
    second.x - first.x;

  const dy =
    second.y - first.y;

  const distance =
    Math.max(
      Math.abs(dx),
      Math.abs(dy)
    );

  if (distance === 0) {
    return [first];
  }

  const result = [];

  for (
    let index = 0;
    index <= distance;
    index++
  ) {
    const progress =
      index / distance;

    result.push({
      x: Math.round(
        first.x +
          dx * progress
      ),

      y: Math.round(
        first.y +
          dy * progress
      ),
    });
  }

  return uniqueCells(result);
}

export function BlockEditor({
  layout,
  tool,
  editMode,
}) {
  const [
    portalTarget,
    setPortalTarget,
  ] = useState(null);

  const [
    blocks,
    setBlocks,
  ] = useState([]);

  const [
    detectors,
    setDetectors,
  ] = useState([]);

  const [
    selectedBlockId,
    setSelectedBlockId,
  ] = useState(null);

  const [
    drawing,
    setDrawing,
  ] = useState(false);

  const [
    draftCells,
    setDraftCells,
  ] = useState([]);

  const [
    draftStart,
    setDraftStart,
  ] = useState(null);

  const [
    blockForm,
    setBlockForm,
  ] = useState({
    name: "",
    lengthMm: "1000",
    direction:
      BlockDirection.BOTH,
  });

  const [
    markerForm,
    setMarkerForm,
  ] = useState({
    type:
      BlockMarkerType.STOP,
    positionMm: "0",
    lengthMm: "100",
    direction:
      BlockDirection.BOTH,
  });

  const [
    detectorForm,
    setDetectorForm,
  ] = useState({
    name: "",
    type:
      ContactDetectorType.PHYSICAL,
    digitalSystemId: "",
    digitalAddress: "",
    role:
      BlockContactRole.OCCUPANCY,
    positionMm: "",
  });

  const [
    digitalSystems,
    setDigitalSystems,
  ] = useState([]);

  const pointerRef =
    useRef(null);

  const selectedBlock =
    blocks.find(
      (block) =>
        block.id ===
        selectedBlockId
    ) ?? null;

  useEffect(() => {
    if (!layout?.id) {
      return;
    }

    let active = true;

    async function load() {
      try {
        const [
          loadedBlocks,
          loadedDetectors,
          systemsResponse,
        ] = await Promise.all([
          getBlocks(
            layout.id
          ),

          getContactDetectors(
            layout.id
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

        setBlocks(
          loadedBlocks
        );

        setDetectors(
          loadedDetectors
        );

        setDigitalSystems(
          systems
        );
      } catch (error) {
        console.error(
          "Blockdaten konnten nicht geladen werden:",
          error
        );
      }
    }

    load();

    return () => {
      active = false;
    };
  }, [layout?.id]);

  useEffect(() => {
    if (!layout?.id) {
      return;
    }

    let frame;

    function attach() {
      const grid =
        document.querySelector(
          ".layout-grid"
        );

      if (!grid) {
        frame =
          requestAnimationFrame(
            attach
          );

        return;
      }

      setPortalTarget(
        grid
      );
    }

    frame =
      requestAnimationFrame(
        attach
      );

    return () => {
      cancelAnimationFrame(
        frame
      );
    };
  }, [layout?.id]);

  useEffect(() => {
    if (
      tool !== Tool.BLOCK
    ) {
      setDrawing(false);
      setDraftCells([]);
      setDraftStart(null);
    }
  }, [tool]);

  function getCellFromEvent(
    event
  ) {
    const svg =
      event.currentTarget;

    const rect =
      svg.getBoundingClientRect();

    const x =
      Math.floor(
        (
          event.clientX -
          rect.left
        ) / CELL_SIZE
      );

    const y =
      Math.floor(
        (
          event.clientY -
          rect.top
        ) / CELL_SIZE
      );

    if (
      x < 0 ||
      y < 0 ||
      x >= layout.width ||
      y >= layout.height
    ) {
      return null;
    }

    return {
      x,
      y,
    };
  }

  function handlePointerDown(
    event
  ) {
    if (
      !editMode ||
      tool !== Tool.BLOCK
    ) {
      return;
    }

    const cell =
      getCellFromEvent(
        event
      );

    if (!cell) {
      return;
    }

    pointerRef.current =
      event.pointerId;

    event.currentTarget.setPointerCapture(
      event.pointerId
    );

    setDrawing(true);
    setDraftStart(cell);
    setDraftCells([cell]);
  }

  function handlePointerMove(
    event
  ) {
    if (
      !drawing ||
      pointerRef.current !==
        event.pointerId
    ) {
      return;
    }

    const cell =
      getCellFromEvent(
        event
      );

    if (!cell) {
      return;
    }

    if (!draftStart) {
      return;
    }

    const between =
      cellsBetween(
        draftStart,
        cell
      );

    setDraftCells(
      between
    );
  }

  function handlePointerUp(
    event
  ) {
    if (
      pointerRef.current !==
      event.pointerId
    ) {
      return;
    }

    pointerRef.current =
      null;

    setDrawing(false);

    if (
      event.currentTarget.hasPointerCapture(
        event.pointerId
      )
    ) {
      event.currentTarget.releasePointerCapture(
        event.pointerId
      );
    }

    if (
      draftCells.length === 0
    ) {
      return;
    }

    setBlockForm({
      name:
        `Block ${blocks.length + 1}`,

      lengthMm:
        String(
          Math.max(
            1,
            draftCells.length *
              200
          )
        ),

      direction:
        BlockDirection.BOTH,
    });
  }

  async function saveBlock() {
    if (
      draftCells.length === 0
    ) {
      return;
    }

    try {
      const created =
        await createBlock(
          layout.id,
          {
            name:
              blockForm.name.trim() ||
              `Block ${
                blocks.length + 1
              }`,

            lengthMm:
              Number(
                blockForm.lengthMm
              ),

            direction:
              blockForm.direction,

            cells:
              draftCells,
          }
        );

      setBlocks(
        (current) => [
          ...current,
          created,
        ]
      );

      setSelectedBlockId(
        created.id
      );

      setDraftCells([]);
      setDraftStart(null);

      setBlockForm({
        name: "",
        lengthMm: "1000",
        direction:
          BlockDirection.BOTH,
      });
    } catch (error) {
      console.error(
        "Block konnte nicht gespeichert werden:",
        error
      );
    }
  }

  async function removeBlock(
    block
  ) {
    if (
      !window.confirm(
        `Block "${block.name}" wirklich löschen?`
      )
    ) {
      return;
    }

    try {
      await deleteBlock(
        layout.id,
        block.id
      );

      setBlocks(
        (current) =>
          current.filter(
            (item) =>
              item.id !==
              block.id
          )
      );

      if (
        selectedBlockId ===
        block.id
      ) {
        setSelectedBlockId(
          null
        );
      }
    } catch (error) {
      console.error(
        "Block konnte nicht gelöscht werden:",
        error
      );
    }
  }

  async function saveMarker() {
    if (
      !selectedBlock
    ) {
      return;
    }

    try {
      const marker =
        await addBlockMarker(
          layout.id,
          selectedBlock.id,
          {
            type:
              markerForm.type,

            positionMm:
              Number(
                markerForm.positionMm
              ),

            lengthMm:
              Number(
                markerForm.lengthMm
              ),

            direction:
              markerForm.direction,
          }
        );

      setBlocks(
        (current) =>
          current.map(
            (block) =>
              block.id ===
              selectedBlock.id
                ? {
                    ...block,

                    markers: [
                      ...block.markers,
                      marker,
                    ],
                  }
                : block
          )
      );
    } catch (error) {
      console.error(
        "Markierung konnte nicht gespeichert werden:",
        error
      );
    }
  }

  async function removeMarker(
    marker
  ) {
    if (
      !selectedBlock
    ) {
      return;
    }

    try {
      await deleteBlockMarker(
        layout.id,
        marker.id
      );

      setBlocks(
        (current) =>
          current.map(
            (block) =>
              block.id ===
              selectedBlock.id
                ? {
                    ...block,

                    markers:
                      block.markers.filter(
                        (item) =>
                          item.id !==
                          marker.id
                      ),
                  }
                : block
          )
      );
    } catch (error) {
      console.error(
        "Markierung konnte nicht gelöscht werden:",
        error
      );
    }
  }

  async function createDetectorAndAssign() {
    if (
      !selectedBlock
    ) {
      return;
    }

    try {
      const detector =
        await createContactDetector(
          layout.id,
          {
            name:
              detectorForm.name.trim(),

            type:
              detectorForm.type,

            digitalSystemId:
              detectorForm.type ===
              ContactDetectorType.PHYSICAL
                ? detectorForm.digitalSystemId ||
                  null
                : null,

            digitalAddress:
              detectorForm.type ===
              ContactDetectorType.PHYSICAL
                ? Number(
                    detectorForm.digitalAddress
                  )
                : null,
          }
        );

      setDetectors(
        (current) => [
          ...current,
          detector,
        ]
      );

      const assignment =
        await assignContactDetector(
          layout.id,
          selectedBlock.id,
          {
            contactDetectorId:
              detector.id,

            role:
              detectorForm.role,

            positionMm:
              detectorForm.positionMm ===
              ""
                ? null
                : Number(
                    detectorForm.positionMm
                  ),
          }
        );

      setBlocks(
        (current) =>
          current.map(
            (block) =>
              block.id ===
              selectedBlock.id
                ? {
                    ...block,

                    contacts: [
                      ...block.contacts,
                      assignment,
                    ],
                  }
                : block
          )
      );

      setDetectorForm({
        name: "",
        type:
          ContactDetectorType.PHYSICAL,
        digitalSystemId: "",
        digitalAddress: "",
        role:
          BlockContactRole.OCCUPANCY,
        positionMm: "",
      });
    } catch (error) {
      console.error(
        "Kontaktmelder konnte nicht angelegt werden:",
        error
      );
    }
  }

  async function removeAssignment(
    assignment
  ) {
    if (
      !selectedBlock
    ) {
      return;
    }

    try {
      await deleteContactAssignment(
        layout.id,
        assignment.id
      );

      setBlocks(
        (current) =>
          current.map(
            (block) =>
              block.id ===
              selectedBlock.id
                ? {
                    ...block,

                    contacts:
                      block.contacts.filter(
                        (item) =>
                          item.id !==
                          assignment.id
                      ),
                  }
                : block
          )
      );
    } catch (error) {
      console.error(
        "Kontaktzuordnung konnte nicht gelöscht werden:",
        error
      );
    }
  }

  function getMarkerPosition(
    block,
    marker
  ) {
    if (
      !block.cells?.length
    ) {
      return {
        x: 0,
        y: 0,
      };
    }

    const ratio =
      Math.min(
        1,
        Math.max(
          0,
          marker.positionMm /
            Math.max(
              1,
              block.lengthMm
            )
        )
      );

    const index =
      ratio *
      Math.max(
        0,
        block.cells.length - 1
      );

    const lower =
      Math.floor(index);

    const upper =
      Math.min(
        block.cells.length - 1,
        Math.ceil(index)
      );

    const progress =
      index - lower;

    const first =
      block.cells[lower];

    const second =
      block.cells[upper];

    return {
      x:
        (
          first.x +
          (
            second.x -
            first.x
          ) *
            progress
        ) *
          CELL_SIZE +
        CELL_SIZE / 2,

      y:
        (
          first.y +
          (
            second.y -
            first.y
          ) *
            progress
        ) *
          CELL_SIZE +
        CELL_SIZE / 2,
    };
  }

  function renderBlock(
    block
  ) {
    const active =
      selectedBlockId ===
      block.id;

    return (
      <g
        key={block.id}
        className={
          active
            ? "rail-block active"
            : "rail-block"
        }
        onClick={(event) => {
          event.stopPropagation();
          setSelectedBlockId(
            block.id
          );
        }}
      >
        {block.cells.map(
          (cell) => (
            <rect
              key={
                `${block.id}-${cell.x}-${cell.y}`
              }
              x={
                cell.x *
                CELL_SIZE +
                3
              }
              y={
                cell.y *
                CELL_SIZE +
                3
              }
              width={
                CELL_SIZE - 6
              }
              height={
                CELL_SIZE - 6
              }
              rx="5"
            />
          )
        )}

        {block.cells.length >
          1 && (
          <polyline
            className="rail-block-centerline"
            points={block.cells
              .map(
                (cell) =>
                  `${
                    cell.x *
                      CELL_SIZE +
                    CELL_SIZE / 2
                  },${
                    cell.y *
                      CELL_SIZE +
                    CELL_SIZE / 2
                  }`
              )
              .join(" ")}
          />
        )}

        {block.markers.map(
          (marker) => {
            const position =
              getMarkerPosition(
                block,
                marker
              );

            return (
              <g
                key={
                  marker.id
                }
                className={
                  `rail-block-marker rail-block-marker-${marker.type.toLowerCase()}`
                }
              >
                <line
                  x1={
                    position.x - 9
                  }
                  y1={
                    position.y - 9
                  }
                  x2={
                    position.x + 9
                  }
                  y2={
                    position.y + 9
                  }
                />

                <text
                  x={
                    position.x + 11
                  }
                  y={
                    position.y - 11
                  }
                >
                  {marker.type ===
                  "BRAKE"
                    ? "B"
                    : marker.type ===
                        "STOP"
                      ? "H"
                      : marker.type ===
                          "ENTRY"
                        ? "E"
                        : "A"}
                </text>
              </g>
            );
          }
        )}
      </g>
    );
  }

  function renderDraft() {
    if (
      !draftCells.length
    ) {
      return null;
    }

    return (
      <g className="rail-block-draft">
        {draftCells.map(
          (cell) => (
            <rect
              key={`${cell.x}-${cell.y}`}
              x={
                cell.x *
                  CELL_SIZE +
                5
              }
              y={
                cell.y *
                  CELL_SIZE +
                5
              }
              width={
                CELL_SIZE - 10
              }
              height={
                CELL_SIZE - 10
              }
              rx="5"
            />
          )
        )}
      </g>
    );
  }

  const selectedDetectorIds =
    useMemo(
      () =>
        new Set(
          selectedBlock?.contacts?.map(
            (contact) =>
              contact.contactDetectorId
          ) ?? []
        ),
      [selectedBlock]
    );

  if (
    !portalTarget ||
    !layout
  ) {
    return null;
  }

  const interactive =
    editMode &&
    tool === Tool.BLOCK;

  return createPortal(
    <div
      className={
        interactive
          ? "block-editor-overlay interactive"
          : "block-editor-overlay"
      }
    >
      <svg
        className="block-editor-svg"
        width={
          layout.width *
          CELL_SIZE
        }
        height={
          layout.height *
          CELL_SIZE
        }
        viewBox={
          `0 0 ${
            layout.width *
            CELL_SIZE
          } ${
            layout.height *
            CELL_SIZE
          }`
        }
        onPointerDown={
          interactive
            ? handlePointerDown
            : undefined
        }
        onPointerMove={
          interactive
            ? handlePointerMove
            : undefined
        }
        onPointerUp={
          interactive
            ? handlePointerUp
            : undefined
        }
        onPointerCancel={
          interactive
            ? handlePointerUp
            : undefined
        }
      >
        {blocks.map(
          renderBlock
        )}

        {renderDraft()}
      </svg>

      {interactive && (
        <div className="block-editor-panel">
          <div className="block-editor-panel-header">
            <strong>
              Blöcke
            </strong>

            <span>
              {blocks.length}
            </span>
          </div>

          <div className="block-list">
            {blocks.length === 0 && (
              <div className="block-empty">
                Ziehe mit der Maus über
                ein Gleis, um einen Block
                anzulegen.
              </div>
            )}

            {blocks.map(
              (block) => (
                <div
                  key={block.id}
                  className={
                    selectedBlockId ===
                    block.id
                      ? "block-list-item active"
                      : "block-list-item"
                  }
                  onClick={() =>
                    setSelectedBlockId(
                      block.id
                    )
                  }
                >
                  <span>
                    {block.name}
                  </span>

                  <small>
                    {block.lengthMm} mm
                  </small>

                  <button
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();
                      void removeBlock(
                        block
                      );
                    }}
                  >
                    ×
                  </button>
                </div>
              )
            )}
          </div>

          {draftCells.length >
            0 && (
            <div className="block-editor-section">
              <h4>
                Neuer Block
              </h4>

              <label>
                Name
                <input
                  value={
                    blockForm.name
                  }
                  onChange={(event) =>
                    setBlockForm(
                      (current) => ({
                        ...current,
                        name:
                          event.target
                            .value,
                      })
                    )
                  }
                />
              </label>

              <label>
                Länge (mm)
                <input
                  type="number"
                  min="1"
                  value={
                    blockForm.lengthMm
                  }
                  onChange={(event) =>
                    setBlockForm(
                      (current) => ({
                        ...current,
                        lengthMm:
                          event.target
                            .value,
                      })
                    )
                  }
                />
              </label>

              <label>
                Richtung
                <select
                  value={
                    blockForm.direction
                  }
                  onChange={(event) =>
                    setBlockForm(
                      (current) => ({
                        ...current,
                        direction:
                          event.target
                            .value,
                      })
                    )
                  }
                >
                  <option value="BOTH">
                    Beide Richtungen
                  </option>

                  <option value="FORWARD">
                    Vorwärts
                  </option>

                  <option value="REVERSE">
                    Rückwärts
                  </option>
                </select>
              </label>

              <button
                type="button"
                className="block-primary-button"
                onClick={() =>
                  void saveBlock()
                }
              >
                Block speichern
              </button>
            </div>
          )}

          {selectedBlock && (
            <>
              <div className="block-editor-section">
                <h4>
                  {selectedBlock.name}
                </h4>

                <div className="block-info">
                  Länge:{" "}
                  {selectedBlock.lengthMm} mm
                  <br />
                  Zellen:{" "}
                  {
                    selectedBlock.cells
                      .length
                  }
                </div>
              </div>

              <div className="block-editor-section">
                <h4>
                  Brems-/Haltemarkierung
                </h4>

                <label>
                  Typ
                  <select
                    value={
                      markerForm.type
                    }
                    onChange={(event) =>
                      setMarkerForm(
                        (current) => ({
                          ...current,
                          type:
                            event.target
                              .value,
                        })
                      )
                    }
                  >
                    <option value="BRAKE">
                      Bremsrampe
                    </option>

                    <option value="STOP">
                      Haltemarkierung
                    </option>

                    <option value="ENTRY">
                      Einfahrt
                    </option>

                    <option value="EXIT">
                      Ausfahrt
                    </option>
                  </select>
                </label>

                <label>
                  Position (mm)
                  <input
                    type="number"
                    min="0"
                    value={
                      markerForm.positionMm
                    }
                    onChange={(event) =>
                      setMarkerForm(
                        (current) => ({
                          ...current,
                          positionMm:
                            event.target
                              .value,
                        })
                      )
                    }
                  />
                </label>

                <label>
                  Länge (mm)
                  <input
                    type="number"
                    min="1"
                    value={
                      markerForm.lengthMm
                    }
                    onChange={(event) =>
                      setMarkerForm(
                        (current) => ({
                          ...current,
                          lengthMm:
                            event.target
                              .value,
                        })
                      )
                    }
                  />
                </label>

                <label>
                  Richtung
                  <select
                    value={
                      markerForm.direction
                    }
                    onChange={(event) =>
                      setMarkerForm(
                        (current) => ({
                          ...current,
                          direction:
                            event.target
                              .value,
                        })
                      )
                    }
                  >
                    <option value="BOTH">
                      Beide
                    </option>

                    <option value="FORWARD">
                      Vorwärts
                    </option>

                    <option value="REVERSE">
                      Rückwärts
                    </option>
                  </select>
                </label>

                <button
                  type="button"
                  className="block-secondary-button"
                  onClick={() =>
                    void saveMarker()
                  }
                >
                  Markierung hinzufügen
                </button>

                <div className="block-items">
                  {selectedBlock.markers.map(
                    (marker) => (
                      <div
                        className="block-item"
                        key={marker.id}
                      >
                        <span>
                          {marker.type}
                          {" · "}
                          {
                            marker.positionMm
                          } mm
                          {" · "}
                          {
                            marker.lengthMm
                          } mm
                        </span>

                        <button
                          type="button"
                          onClick={() =>
                            void removeMarker(
                              marker
                            )
                          }
                        >
                          ×
                        </button>
                      </div>
                    )
                  )}
                </div>
              </div>

              <div className="block-editor-section">
                <h4>
                  Kontaktmelder
                </h4>

                <label>
                  Name
                  <input
                    value={
                      detectorForm.name
                    }
                    onChange={(event) =>
                      setDetectorForm(
                        (current) => ({
                          ...current,
                          name:
                            event.target
                              .value,
                        })
                      )
                    }
                    placeholder="z. B. RMK 101"
                  />
                </label>

                <label>
                  Typ
                  <select
                    value={
                      detectorForm.type
                    }
                    onChange={(event) =>
                      setDetectorForm(
                        (current) => ({
                          ...current,
                          type:
                            event.target
                              .value,
                        })
                      )
                    }
                  >
                    <option value="PHYSICAL">
                      Physisch
                    </option>

                    <option value="VIRTUAL">
                      Virtuell
                    </option>
                  </select>
                </label>

                {detectorForm.type ===
                  ContactDetectorType.PHYSICAL && (
                  <>
                    <label>
                      Digitalsystem
                      <select
                        value={
                          detectorForm.digitalSystemId
                        }
                        onChange={(event) =>
                          setDetectorForm(
                            (current) => ({
                              ...current,
                              digitalSystemId:
                                event.target
                                  .value,
                            })
                          )
                        }
                      >
                        <option value="">
                          Bitte wählen
                        </option>

                        {digitalSystems.map(
                          (system) => (
                            <option
                              key={
                                system.id
                              }
                              value={
                                system.id
                              }
                            >
                              {system.name}
                            </option>
                          )
                        )}
                      </select>
                    </label>

                    <label>
                      Adresse
                      <input
                        type="number"
                        min="1"
                        value={
                          detectorForm.digitalAddress
                        }
                        onChange={(event) =>
                          setDetectorForm(
                            (current) => ({
                              ...current,
                              digitalAddress:
                                event.target
                                  .value,
                            })
                          )
                        }
                      />
                    </label>
                  </>
                )}

                <label>
                  Rolle
                  <select
                    value={
                      detectorForm.role
                    }
                    onChange={(event) =>
                      setDetectorForm(
                        (current) => ({
                          ...current,
                          role:
                            event.target
                              .value,
                        })
                      )
                    }
                  >
                    <option value="ENTRY">
                      Einfahrt
                    </option>

                    <option value="OCCUPANCY">
                      Belegung
                    </option>

                    <option value="EXIT">
                      Ausfahrt
                    </option>
                  </select>
                </label>

                <label>
                  Position (mm)
                  <input
                    type="number"
                    min="0"
                    value={
                      detectorForm.positionMm
                    }
                    onChange={(event) =>
                      setDetectorForm(
                        (current) => ({
                          ...current,
                          positionMm:
                            event.target
                              .value,
                        })
                      )
                    }
                  />
                </label>

                <button
                  type="button"
                  className="block-secondary-button"
                  onClick={() =>
                    void createDetectorAndAssign()
                  }
                >
                  Melder anlegen und zuordnen
                </button>

                <div className="block-items">
                  {selectedBlock.contacts.map(
                    (contact) => (
                      <div
                        className="block-item"
                        key={
                          contact.id
                        }
                      >
                        <span>
                          {
                            contact.contactDetectorName
                          }
                          {" · "}
                          {contact.role}
                        </span>

                        <button
                          type="button"
                          onClick={() =>
                            void removeAssignment(
                              contact
                            )
                          }
                        >
                          ×
                        </button>
                      </div>
                    )
                  )}
                </div>

                {detectors.length >
                  0 && (
                  <div className="block-detector-hint">
                    Vorhandene Melder:{" "}
                    {
                      detectors.filter(
                        (detector) =>
                          !selectedDetectorIds.has(
                            detector.id
                          )
                      ).length
                    }
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      )}
    </div>,
    portalTarget
  );
}
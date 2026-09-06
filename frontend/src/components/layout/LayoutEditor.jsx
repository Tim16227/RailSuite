import { useRef, useState } from "react";

import {
  LayoutElementType,
  LayoutOrientation,
  LayoutTurnoutHand,
  Tool,
} from "../../models/layout";

import {
  setLayoutCell,
  deleteLayoutCell,
} from "../../api/layoutApi";

import { LayoutGrid } from "./LayoutGrid";

export function LayoutEditor({
  initialLayout,
  tool,
  setTool,
}) {
  const [layout, setLayout] =
    useState(initialLayout);

  const processingStrokeRef =
    useRef(false);

  async function handleStrokeComplete(
    points
  ) {
    if (
      processingStrokeRef.current
    ) {
      return;
    }

    processingStrokeRef.current =
      true;

    try {
      if (
        tool === Tool.ERASER
      ) {
        await eraseStroke(points);
      } else {
        await drawStroke(points);
      }
    } catch (error) {
      console.error(
        "Fehler beim Verarbeiten des Strokes:",
        error
      );
    } finally {
      processingStrokeRef.current =
        false;
    }
  }

  async function handleCellAction(
    point
  ) {
    if (
      processingStrokeRef.current
    ) {
      return;
    }

    processingStrokeRef.current =
      true;

    try {
      if (
        tool === Tool.STRAIGHT
      ) {
        await setManualElement(
          point,
          LayoutElementType.STRAIGHT,
          LayoutOrientation.EAST,
          null
        );

        return;
      }

      if (
        tool === Tool.CURVE_45
      ) {
        await setManualElement(
          point,
          LayoutElementType.CURVE_45,
          LayoutOrientation.EAST,
          null
        );

        return;
      }

      if (
        tool === Tool.CURVE_90
      ) {
        await setManualElement(
          point,
          LayoutElementType.CURVE_90,
          LayoutOrientation.EAST,
          null
        );

        return;
      }

      if (
        tool === Tool.TURNOUT_LEFT
      ) {
        await setManualElement(
          point,
          LayoutElementType.TURNOUT,
          LayoutOrientation.EAST,
          LayoutTurnoutHand.LEFT
        );

        return;
      }

      if (
        tool === Tool.TURNOUT_RIGHT
      ) {
        await setManualElement(
          point,
          LayoutElementType.TURNOUT,
          LayoutOrientation.EAST,
          LayoutTurnoutHand.RIGHT
        );

        return;
      }

      if (
        tool === Tool.ROTATE_CW
      ) {
        await rotateCell(
          point,
          1
        );

        return;
      }

      if (
        tool === Tool.ROTATE_CCW
      ) {
        await rotateCell(
          point,
          -1
        );
      }
    } catch (error) {
      console.error(
        "Fehler beim manuellen Bearbeiten der Zelle:",
        error
      );
    } finally {
      processingStrokeRef.current =
        false;
    }
  }

  async function setManualElement(
    point,
    elementType,
    orientation,
    turnoutHand
  ) {
    const updatedCell =
      await setLayoutCell(
        layout.id,
        point.x,
        point.y,
        elementType,
        orientation,
        turnoutHand
      );

    updateCell(
      updatedCell
    );
  }

  async function rotateCell(
    point,
    steps
  ) {
    const cell =
      layout.cells.find(
        (currentCell) =>
          currentCell.x === point.x &&
          currentCell.y === point.y
      );

    if (!cell) {
      return;
    }

    const orientation =
      rotateOrientation(
        cell.orientation,
        steps
      );

    const updatedCell =
      await setLayoutCell(
        layout.id,
        cell.x,
        cell.y,
        cell.elementType,
        orientation,
        cell.turnoutHand
      );

    updateCell(
      updatedCell
    );
  }

  function rotateOrientation(
    orientation,
    steps
  ) {
    const orientations = [
      LayoutOrientation.NORTH,
      LayoutOrientation.NORTH_EAST,
      LayoutOrientation.EAST,
      LayoutOrientation.SOUTH_EAST,
      LayoutOrientation.SOUTH,
      LayoutOrientation.SOUTH_WEST,
      LayoutOrientation.WEST,
      LayoutOrientation.NORTH_WEST,
    ];

    const index =
      orientations.indexOf(
        orientation
      );

    if (index < 0) {
      return orientation;
    }

    const nextIndex =
      Math.floor(
        (
          index + steps
        ) %
          orientations.length
      );

    const normalizedIndex =
      nextIndex < 0
        ? nextIndex +
          orientations.length
        : nextIndex;

    return orientations[
      normalizedIndex
    ];
  }

  async function eraseStroke(
    points
  ) {
    const uniquePoints =
      getUniquePoints(points);

    for (
      const point of uniquePoints
    ) {
      await deleteLayoutCell(
        layout.id,
        point.x,
        point.y
      );
    }

    const deletedKeys =
      new Set(
        uniquePoints.map(
          (point) =>
            `${point.x}:${point.y}`
        )
      );

    setLayout(
      (current) => ({
        ...current,
        cells:
          current.cells.filter(
            (cell) =>
              !deletedKeys.has(
                `${cell.x}:${cell.y}`
              )
          ),
      })
    );
  }

  async function drawStroke(
    points
  ) {
    const normalized =
      normalizeStroke(points);

    if (
      normalized.length === 0
    ) {
      return;
    }

    const turnout =
      detectTurnout(
        normalized
      );

    if (turnout) {
      await createTurnout(
        turnout
      );

      return;
    }

    const elements =
      recognizeStroke(
        normalized
      );

    for (
      const element of elements
    ) {
      const updatedCell =
        await setLayoutCell(
          layout.id,
          element.x,
          element.y,
          element.elementType,
          element.orientation,
          element.turnoutHand
        );

      updateCell(
        updatedCell
      );
    }
  }

  function normalizeStroke(
    points
  ) {
    const unique =
      getUniquePoints(points);

    if (
      unique.length <= 2
    ) {
      return unique;
    }

    return unique;
  }

  function recognizeStroke(
    points
  ) {
    if (
      points.length === 1
    ) {
      return [
        {
          x: points[0].x,
          y: points[0].y,
          elementType:
            LayoutElementType.STRAIGHT,
          orientation:
            LayoutOrientation.EAST,
          turnoutHand: null,
        },
      ];
    }

    if (
      points.length === 2
    ) {
      return [
        createStraightElement(
          points[0],
          points[1]
        ),
      ];
    }

    const result = [];

    for (
      let index = 0;
      index < points.length;
      index++
    ) {
      const current =
        points[index];

      const previous =
        points[index - 1] ??
        current;

      const next =
        points[index + 1] ??
        current;

      const incoming =
        getDirection(
          previous,
          current
        );

      const outgoing =
        getDirection(
          current,
          next
        );

      if (
        index === 0
      ) {
        result.push(
          createStraightFromDirection(
            current,
            outgoing
          )
        );

        continue;
      }

      if (
        index ===
        points.length - 1
      ) {
        result.push(
          createStraightFromDirection(
            current,
            incoming
          )
        );

        continue;
      }

      if (
        sameAxisDirection(
          incoming,
          outgoing
        )
      ) {
        result.push(
          createStraightFromDirection(
            current,
            outgoing
          )
        );

        continue;
      }

      if (
        is45DegreeTurn(
          incoming,
          outgoing
        )
      ) {
        result.push({
          x: current.x,
          y: current.y,
          elementType:
            LayoutElementType.CURVE_45,
          orientation:
            getCurve45Orientation(
              incoming,
              outgoing
            ),
          turnoutHand: null,
        });

        continue;
      }

      if (
        is90DegreeTurn(
          incoming,
          outgoing
        )
      ) {
        result.push({
          x: current.x,
          y: current.y,
          elementType:
            LayoutElementType.CURVE_90,
          orientation:
            getCurve90Orientation(
              incoming,
              outgoing
            ),
          turnoutHand: null,
        });

        continue;
      }

      result.push(
        createStraightFromDirection(
          current,
          outgoing
        )
      );
    }

    return removeDuplicateElements(
      result
    );
  }

  function createStraightElement(
    first,
    second
  ) {
    return createStraightFromDirection(
      first,
      getDirection(
        first,
        second
      )
    );
  }

  function createStraightFromDirection(
    point,
    direction
  ) {
    return {
      x: point.x,
      y: point.y,
      elementType:
        LayoutElementType.STRAIGHT,
      orientation:
        directionToOrientation(
          direction
        ),
      turnoutHand: null,
    };
  }

  function getDirection(
    from,
    to
  ) {
    const dx =
      Math.sign(
        to.x - from.x
      );

    const dy =
      Math.sign(
        to.y - from.y
      );

    if (
      dx === 0 &&
      dy < 0
    ) {
      return "NORTH";
    }

    if (
      dx > 0 &&
      dy < 0
    ) {
      return "NORTH_EAST";
    }

    if (
      dx > 0 &&
      dy === 0
    ) {
      return "EAST";
    }

    if (
      dx > 0 &&
      dy > 0
    ) {
      return "SOUTH_EAST";
    }

    if (
      dx === 0 &&
      dy > 0
    ) {
      return "SOUTH";
    }

    if (
      dx < 0 &&
      dy > 0
    ) {
      return "SOUTH_WEST";
    }

    if (
      dx < 0 &&
      dy === 0
    ) {
      return "WEST";
    }

    if (
      dx < 0 &&
      dy < 0
    ) {
      return "NORTH_WEST";
    }

    return "EAST";
  }

  function directionToOrientation(
    direction
  ) {
    switch (direction) {
      case "NORTH":
        return LayoutOrientation.NORTH;

      case "NORTH_EAST":
        return LayoutOrientation.NORTH_EAST;

      case "EAST":
        return LayoutOrientation.EAST;

      case "SOUTH_EAST":
        return LayoutOrientation.SOUTH_EAST;

      case "SOUTH":
        return LayoutOrientation.SOUTH;

      case "SOUTH_WEST":
        return LayoutOrientation.SOUTH_WEST;

      case "WEST":
        return LayoutOrientation.WEST;

      case "NORTH_WEST":
        return LayoutOrientation.NORTH_WEST;

      default:
        return LayoutOrientation.EAST;
    }
  }

  function sameAxisDirection(
    first,
    second
  ) {
    if (
      first === second
    ) {
      return true;
    }

    const horizontal =
      (
        first === "EAST" ||
        first === "WEST"
      ) &&
      (
        second === "EAST" ||
        second === "WEST"
      );

    const vertical =
      (
        first === "NORTH" ||
        first === "SOUTH"
      ) &&
      (
        second === "NORTH" ||
        second === "SOUTH"
      );

    return (
      horizontal ||
      vertical
    );
  }

  function is45DegreeTurn(
    first,
    second
  ) {
    const diagonalDirections = [
      "NORTH_EAST",
      "SOUTH_EAST",
      "SOUTH_WEST",
      "NORTH_WEST",
    ];

    const cardinalDirections = [
      "NORTH",
      "EAST",
      "SOUTH",
      "WEST",
    ];

    return (
      (
        cardinalDirections.includes(
          first
        ) &&
        diagonalDirections.includes(
          second
        )
      ) ||
      (
        diagonalDirections.includes(
          first
        ) &&
        cardinalDirections.includes(
          second
        )
      )
    );
  }

  function is90DegreeTurn(
    first,
    second
  ) {
    const horizontal =
      first === "EAST" ||
      first === "WEST";

    const vertical =
      first === "NORTH" ||
      first === "SOUTH";

    const secondHorizontal =
      second === "EAST" ||
      second === "WEST";

    const secondVertical =
      second === "NORTH" ||
      second === "SOUTH";

    return (
      (
        horizontal &&
        secondVertical
      ) ||
      (
        vertical &&
        secondHorizontal
      )
    );
  }

  function getCurve45Orientation(
    incoming,
    outgoing
  ) {
    const directions = [
      incoming,
      outgoing,
    ];

    if (
      directions.includes(
        "NORTH"
      ) &&
      directions.includes(
        "EAST"
      )
    ) {
      return LayoutOrientation.NORTH;
    }

    if (
      directions.includes(
        "EAST"
      ) &&
      directions.includes(
        "SOUTH"
      )
    ) {
      return LayoutOrientation.EAST;
    }

    if (
      directions.includes(
        "SOUTH"
      ) &&
      directions.includes(
        "WEST"
      )
    ) {
      return LayoutOrientation.SOUTH;
    }

    if (
      directions.includes(
        "WEST"
      ) &&
      directions.includes(
        "NORTH"
      )
    ) {
      return LayoutOrientation.WEST;
    }

    if (
      directions.includes(
        "EAST"
      ) &&
      directions.includes(
        "NORTH_EAST"
      )
    ) {
      return LayoutOrientation.NORTH_EAST;
    }

    if (
      directions.includes(
        "EAST"
      ) &&
      directions.includes(
        "SOUTH_EAST"
      )
    ) {
      return LayoutOrientation.SOUTH_EAST;
    }

    if (
      directions.includes(
        "WEST"
      ) &&
      directions.includes(
        "NORTH_WEST"
      )
    ) {
      return LayoutOrientation.NORTH_WEST;
    }

    if (
      directions.includes(
        "WEST"
      ) &&
      directions.includes(
        "SOUTH_WEST"
      )
    ) {
      return LayoutOrientation.SOUTH_WEST;
    }

    if (
      directions.includes(
        "NORTH"
      ) &&
      directions.includes(
        "NORTH_EAST"
      )
    ) {
      return LayoutOrientation.NORTH_EAST;
    }

    if (
      directions.includes(
        "NORTH"
      ) &&
      directions.includes(
        "NORTH_WEST"
      )
    ) {
      return LayoutOrientation.NORTH_WEST;
    }

    if (
      directions.includes(
        "SOUTH"
      ) &&
      directions.includes(
        "SOUTH_EAST"
      )
    ) {
      return LayoutOrientation.SOUTH_EAST;
    }

    if (
      directions.includes(
        "SOUTH"
      ) &&
      directions.includes(
        "SOUTH_WEST"
      )
    ) {
      return LayoutOrientation.SOUTH_WEST;
    }

    return directionToOrientation(
      outgoing
    );
  }

  function getCurve90Orientation(
    incoming,
    outgoing
  ) {
    if (
      (
        incoming === "NORTH" &&
        outgoing === "EAST"
      )
    ) {
      return LayoutOrientation.EAST;
    }

    if (
      (
        incoming === "NORTH" &&
        outgoing === "WEST"
      )
    ) {
      return LayoutOrientation.SOUTH;
    }

    if (
      incoming === "WEST" &&
      outgoing === "NORTH"
    ) {
      return LayoutOrientation.NORTH;
    }

    if (
      incoming === "SOUTH" &&
      outgoing === "EAST"
    ) {
      return LayoutOrientation.NORTH;
    }

    if (
      incoming === "EAST" &&
      outgoing === "SOUTH"
    ) {
      return LayoutOrientation.SOUTH;
    }

    if (
      incoming === "SOUTH" &&
      outgoing === "WEST"
    ) {
      return LayoutOrientation.WEST;
    }

    if (
      incoming === "WEST" &&
      outgoing === "SOUTH"
    ) {
      return LayoutOrientation.EAST;
    }

    return LayoutOrientation.WEST;
  }

  function detectTurnout(
    points
  ) {
    const pointSet =
      new Set(
        points.map(
          (point) =>
            `${point.x}:${point.y}`
        )
      );

    for (
      const center of points
    ) {
      const neighbors =
        getOrthogonalNeighbors(
          center,
          pointSet
        );

      if (
        neighbors.length !== 3
      ) {
        continue;
      }

      if (
        neighbors.includes(
          "EAST"
        ) &&
        neighbors.includes(
          "WEST"
        )
      ) {
        if (
          neighbors.includes(
            "NORTH"
          )
        ) {
          return {
            center,
            orientation:
              LayoutOrientation.EAST,
            hand:
              LayoutTurnoutHand.LEFT,
            points,
          };
        }

        if (
          neighbors.includes(
            "SOUTH"
          )
        ) {
          return {
            center,
            orientation:
              LayoutOrientation.EAST,
            hand:
              LayoutTurnoutHand.RIGHT,
            points,
          };
        }
      }

      if (
        neighbors.includes(
          "NORTH"
        ) &&
        neighbors.includes(
          "SOUTH"
        )
      ) {
        if (
          neighbors.includes(
            "EAST"
          )
        ) {
          return {
            center,
            orientation:
              LayoutOrientation.SOUTH,
            hand:
              LayoutTurnoutHand.LEFT,
            points,
          };
        }

        if (
          neighbors.includes(
            "WEST"
          )
        ) {
          return {
            center,
            orientation:
              LayoutOrientation.SOUTH,
            hand:
              LayoutTurnoutHand.RIGHT,
            points,
          };
        }
      }
    }

    return null;
  }

  function getOrthogonalNeighbors(
    center,
    pointSet
  ) {
    const result = [];

    const directions = [
      {
        name: "NORTH",
        dx: 0,
        dy: -1,
      },
      {
        name: "EAST",
        dx: 1,
        dy: 0,
      },
      {
        name: "SOUTH",
        dx: 0,
        dy: 1,
      },
      {
        name: "WEST",
        dx: -1,
        dy: 0,
      },
    ];

    for (
      const direction of directions
    ) {
      const key =
        `${center.x + direction.dx}:` +
        `${center.y + direction.dy}`;

      if (
        pointSet.has(key)
      ) {
        result.push(
          direction.name
        );
      }
    }

    return result;
  }

  async function createTurnout(
    turnout
  ) {
    const {
      center,
      hand,
      orientation,
      points,
    } = turnout;

    for (
      const point of points
    ) {
      if (
        point.x === center.x &&
        point.y === center.y
      ) {
        continue;
      }

      const armOrientation =
        getArmOrientation(
          center,
          point
        );

      const updatedCell =
        await setLayoutCell(
          layout.id,
          point.x,
          point.y,
          LayoutElementType.STRAIGHT,
          armOrientation,
          null
        );

      updateCell(
        updatedCell
      );
    }

    const turnoutCell =
      await setLayoutCell(
        layout.id,
        center.x,
        center.y,
        LayoutElementType.TURNOUT,
        orientation,
        hand
      );

    updateCell(
      turnoutCell
    );
  }

  function getArmOrientation(
    center,
    point
  ) {
    const dx =
      Math.sign(
        point.x - center.x
      );

    const dy =
      Math.sign(
        point.y - center.y
      );

    if (
      dx > 0 &&
      dy === 0
    ) {
      return LayoutOrientation.EAST;
    }

    if (
      dx < 0 &&
      dy === 0
    ) {
      return LayoutOrientation.WEST;
    }

    if (
      dx === 0 &&
      dy > 0
    ) {
      return LayoutOrientation.SOUTH;
    }

    if (
      dx === 0 &&
      dy < 0
    ) {
      return LayoutOrientation.NORTH;
    }

    if (
      dx > 0 &&
      dy > 0
    ) {
      return LayoutOrientation.SOUTH_EAST;
    }

    if (
      dx > 0 &&
      dy < 0
    ) {
      return LayoutOrientation.NORTH_EAST;
    }

    if (
      dx < 0 &&
      dy > 0
    ) {
      return LayoutOrientation.SOUTH_WEST;
    }

    return LayoutOrientation.NORTH_WEST;
  }

  function removeDuplicateElements(
    elements
  ) {
    const result = [];
    const keys = new Set();

    for (
      const element of elements
    ) {
      const key =
        `${element.x}:` +
        `${element.y}`;

      if (
        keys.has(key)
      ) {
        continue;
      }

      keys.add(key);
      result.push(
        element
      );
    }

    return result;
  }

  function getUniquePoints(
    points
  ) {
    const result = [];
    const keys = new Set();

    for (
      const point of points
    ) {
      const key =
        `${point.x}:${point.y}`;

      if (
        keys.has(key)
      ) {
        continue;
      }

      keys.add(key);
      result.push(
        point
      );
    }

    return result;
  }

  function updateCell(
    updatedCell
  ) {
    setLayout(
      (current) => {
        const cells =
          current.cells.filter(
            (cell) =>
              cell.x !==
                updatedCell.x ||
              cell.y !==
                updatedCell.y
          );

        return {
          ...current,
          cells: [
            ...cells,
            updatedCell,
          ],
        };
      }
    );
  }

  return (
    <div className="layout-editor">

      <div className="layout-editor-canvas">
        <LayoutGrid
          layout={layout}
          tool={tool}
          onStrokeComplete={
            handleStrokeComplete
          }
          onCellAction={
            handleCellAction
          }
        />
      </div>
    </div>
  );
}
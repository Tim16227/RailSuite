import {
  getPortPosition,
} from "./layoutGeometry";

import {
  TrackPath,
} from "./TrackStyle";


const STRAIGHT_INDICATOR = {
  position: 0.70,
  rotation: 0,
};

const BRANCH_INDICATOR = {
  position: 0.30,
  rotation: 0,
};

const INDICATOR_LENGTH = 12;
const INDICATOR_WIDTH = 3.5;


/**
 * Prüft, ob zwei Ports gegenüberliegen.
 *
 * Eine Verbindung zwischen gegenüberliegenden Ports
 * ist die Geradeausverbindung.
 */
function isOppositePort(
  first,
  second
) {
  return (
    (first === "NORTH" &&
      second === "SOUTH") ||
    (first === "SOUTH" &&
      second === "NORTH") ||

    (first === "EAST" &&
      second === "WEST") ||
    (first === "WEST" &&
      second === "EAST") ||

    (first === "NORTH_EAST" &&
      second === "SOUTH_WEST") ||
    (first === "SOUTH_WEST" &&
      second === "NORTH_EAST") ||

    (first === "NORTH_WEST" &&
      second === "SOUTH_EAST") ||
    (first === "SOUTH_EAST" &&
      second === "NORTH_WEST")
  );
}


/**
 * Liefert den Port einer Verbindung,
 * der NICHT der gemeinsame Weichenport ist.
 */
function getOuterPort(
  connection,
  commonPort
) {
  if (
    connection.first ===
    commonPort
  ) {
    return connection.second;
  }

  if (
    connection.second ===
    commonPort
  ) {
    return connection.first;
  }

  return null;
}


/**
 * Sucht die Geradeausverbindung.
 */
function findStraightConnection(
  connections
) {
  return connections.find(
    (connection) =>
      isOppositePort(
        connection.first,
        connection.second
      )
  );
}


/**
 * Sucht den gemeinsamen Ursprung der Weiche.
 *
 * Das ist der Anschluss, den Geradeaus-
 * und Abzweigverbindung gemeinsam haben.
 */
function findCommonPort(
  straightConnection,
  branchConnection
) {
  if (
    straightConnection.first ===
      branchConnection.first ||
    straightConnection.first ===
      branchConnection.second
  ) {
    return straightConnection.first;
  }

  if (
    straightConnection.second ===
      branchConnection.first ||
    straightConnection.second ===
      branchConnection.second
  ) {
    return straightConnection.second;
  }

  return null;
}


/**
 * Gibt die Mitte der Kachel zurück.
 */
function getCenterPosition(
  size
) {
  const center =
    size / 2;

  return {
    x: center,
    y: center,
  };
}


/**
 * Erzeugt die Geometrie eines
 * normalen Weichenarms.
 *
 * Dieser Arm beginnt am tatsächlichen
 * Port und endet am äußeren Port.
 *
 * Wird für die Geradeausverbindung
 * verwendet.
 */
function getStraightArmGeometry(
  connection,
  commonPort,
  size
) {
  const outerPort =
    getOuterPort(
      connection,
      commonPort
    );

  if (!outerPort) {
    return null;
  }

  const origin =
    getPortPosition(
      commonPort,
      size
    );

  const outer =
    getPortPosition(
      outerPort,
      size
    );

  const dx =
    outer.x -
    origin.x;

  const dy =
    outer.y -
    origin.y;

  const length =
    Math.sqrt(
      dx * dx +
        dy * dy
    );

  if (length === 0) {
    return null;
  }

  const alongX =
    dx / length;

  const alongY =
    dy / length;

  const perpendicularX =
    -alongY;

  const perpendicularY =
    alongX;

  const armAngle =
    Math.atan2(
      alongY,
      alongX
    ) *
    180 /
    Math.PI;

  return {
    originX:
      origin.x,

    originY:
      origin.y,

    outerX:
      outer.x,

    outerY:
      outer.y,

    alongX,
    alongY,

    perpendicularX,
    perpendicularY,

    armAngle,

    length,
  };
}


/**
 * Erzeugt die Geometrie des
 * neuen Weichenabzweigs.
 *
 * WICHTIG:
 *
 * Der Abzweig beginnt NICHT mehr
 * am gemeinsamen Außenport.
 *
 * Stattdessen:
 *
 *        Außenport
 *            \
 *             \
 *             ● Mitte
 *
 * Der gemeinsame Weichenursprung
 * liegt damit optisch in der Mitte
 * der Kachel.
 */
function getBranchArmGeometry(
  connection,
  commonPort,
  size
) {
  const outerPort =
    getOuterPort(
      connection,
      commonPort
    );

  if (!outerPort) {
    return null;
  }

  const origin =
    getCenterPosition(
      size
    );

  const outer =
    getPortPosition(
      outerPort,
      size
    );

  const dx =
    outer.x -
    origin.x;

  const dy =
    outer.y -
    origin.y;

  const length =
    Math.sqrt(
      dx * dx +
        dy * dy
    );

  if (length === 0) {
    return null;
  }

  const alongX =
    dx / length;

  const alongY =
    dy / length;

  const perpendicularX =
    -alongY;

  const perpendicularY =
    alongX;

  const armAngle =
    Math.atan2(
      alongY,
      alongX
    ) *
    180 /
    Math.PI;

  return {
    originX:
      origin.x,

    originY:
      origin.y,

    outerX:
      outer.x,

    outerY:
      outer.y,

    alongX,
    alongY,

    perpendicularX,
    perpendicularY,

    armAngle,

    length,
  };
}


/**
 * Berechnet die Indicator-Position.
 *
 * Die Position wird relativ zum tatsächlichen
 * Ursprung des jeweiligen Arms berechnet.
 *
 * Beim Abzweig ist der Ursprung jetzt die
 * Kachelmitte.
 */
function getIndicatorGeometry(
  arm,
  settings
) {
  const distance =
    arm.length *
    settings.position;

  const x =
    arm.originX +
    arm.alongX *
      distance;

  const y =
    arm.originY +
    arm.alongY *
      distance;

  const rotation =
    arm.armAngle +
    settings.rotation;

  return {
    x,
    y,
    rotation,
  };
}


function TurnoutIndicator({
  x,
  y,
  rotation,
}) {
  return (
    <rect
      className="turnout-position-indicator"
      x={
        x -
        INDICATOR_LENGTH / 2
      }
      y={
        y -
        INDICATOR_WIDTH / 2
      }
      width={
        INDICATOR_LENGTH
      }
      height={
        INDICATOR_WIDTH
      }
      rx={1}
      ry={1}
      transform={
        `rotate(${rotation} ${x} ${y})`
      }
    />
  );
}


/**
 * Zeichnet den normalen geraden Weichenarm.
 */
function renderStraightArm(
  arm
) {
  return (
    <TrackPath
      d={`
        M ${arm.originX} ${arm.originY}
        L ${arm.outerX} ${arm.outerY}
      `}
    />
  );
}


/**
 * Zeichnet den neuen Abzweig.
 *
 * Der Abzweig beginnt in der Mitte
 * der Kachel und läuft von dort
 * diagonal zur Ecke.
 */
function renderBranchArm(
  arm
) {
  return (
    <TrackPath
      d={`
        M ${arm.originX} ${arm.originY}
        L ${arm.outerX} ${arm.outerY}
      `}
    />
  );
}


export function TurnoutRenderer({
  connections,
  size,
  turnoutState,
  turnoutHand,
}) {
  /*
   * Sicherheitsprüfung.
   */
  if (
    !connections ||
    connections.length < 2
  ) {
    return null;
  }


  /*
   * ---------------------------------------------------------
   * GERADE VERBINDUNG FINDEN
   * ---------------------------------------------------------
   */

  const straightConnection =
    findStraightConnection(
      connections
    );

  if (!straightConnection) {
    return (
      <>
        {connections.map(
          (
            connection,
            index
          ) => {
            const first =
              getPortPosition(
                connection.first,
                size
              );

            const second =
              getPortPosition(
                connection.second,
                size
              );

            return (
              <TrackPath
                key={index}
                d={`
                  M ${first.x} ${first.y}
                  L ${second.x} ${second.y}
                `}
              />
            );
          }
        )}
      </>
    );
  }


  /*
   * ---------------------------------------------------------
   * ABZWEIGVERBINDUNG FINDEN
   * ---------------------------------------------------------
   */

  const branchConnection =
    connections.find(
      (connection) =>
        connection !==
        straightConnection
    );

  if (!branchConnection) {
    return (
      <>
        {connections.map(
          (
            connection,
            index
          ) => {
            const first =
              getPortPosition(
                connection.first,
                size
              );

            const second =
              getPortPosition(
                connection.second,
                size
              );

            return (
              <TrackPath
                key={index}
                d={`
                  M ${first.x} ${first.y}
                  L ${second.x} ${second.y}
                `}
              />
            );
          }
        )}
      </>
    );
  }


  /*
   * ---------------------------------------------------------
   * GEMEINSAMEN WEICHENPORT FINDEN
   * ---------------------------------------------------------
   */

  const commonPort =
    findCommonPort(
      straightConnection,
      branchConnection
    );

  if (!commonPort) {
    return (
      <>
        {connections.map(
          (
            connection,
            index
          ) => {
            const first =
              getPortPosition(
                connection.first,
                size
              );

            const second =
              getPortPosition(
                connection.second,
                size
              );

            return (
              <TrackPath
                key={index}
                d={`
                  M ${first.x} ${first.y}
                  L ${second.x} ${second.y}
                `}
              />
            );
          }
        )}
      </>
    );
  }


  /*
   * ---------------------------------------------------------
   * ARM-GEOMETRIE
   * ---------------------------------------------------------
   */

  const straightArm =
    getStraightArmGeometry(
      straightConnection,
      commonPort,
      size
    );

  const branchArm =
    getBranchArmGeometry(
      branchConnection,
      commonPort,
      size
    );

  if (
    !straightArm ||
    !branchArm
  ) {
    return null;
  }


  /*
   * ---------------------------------------------------------
   * AKTIVEN ARM BESTIMMEN
   * ---------------------------------------------------------
   *
   * LEFT-Weiche:
   *
   *   LEFT  -> Abzweig
   *   RIGHT -> Geradeaus
   *
   * RIGHT-Weiche:
   *
   *   RIGHT -> Abzweig
   *   LEFT  -> Geradeaus
   */

  const isBranchActive =
    turnoutHand === "RIGHT"
      ? turnoutState ===
        "RIGHT"
      : turnoutState ===
        "LEFT";

  const activeArm =
    isBranchActive
      ? branchArm
      : straightArm;

  const settings =
    isBranchActive
      ? BRANCH_INDICATOR
      : STRAIGHT_INDICATOR;


  /*
   * ---------------------------------------------------------
   * SCHIENEN ZEICHNEN
   * ---------------------------------------------------------
   *
   * Die Gerade läuft weiterhin vollständig
   * von Rand zu Rand.
   *
   * Der Abzweig beginnt dagegen in der Mitte
   * der Kachel.
   */

  const straightTrack =
    renderStraightArm(
      straightArm
    );

  const branchTrack =
    renderBranchArm(
      branchArm
    );


  /*
   * ---------------------------------------------------------
   * INDICATOR
   * ---------------------------------------------------------
   */

  if (!turnoutState) {
    return (
      <>
        {straightTrack}
        {branchTrack}
      </>
    );
  }

  const indicator =
    getIndicatorGeometry(
      activeArm,
      settings
    );


  /*
   * ---------------------------------------------------------
   * RENDER
   * ---------------------------------------------------------
   */

  return (
    <>
      {straightTrack}
      {branchTrack}

      <TurnoutIndicator
        x={indicator.x}
        y={indicator.y}
        rotation={
          indicator.rotation
        }
      />
    </>
  );
}
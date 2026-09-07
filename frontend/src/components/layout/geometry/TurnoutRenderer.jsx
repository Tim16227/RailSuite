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
  position: 0.70,
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
function isOppositePort(first, second) {
  return (
    (first === "NORTH" && second === "SOUTH") ||
    (first === "SOUTH" && second === "NORTH") ||

    (first === "EAST" && second === "WEST") ||
    (first === "WEST" && second === "EAST") ||

    (first === "NORTH_EAST" && second === "SOUTH_WEST") ||
    (first === "SOUTH_WEST" && second === "NORTH_EAST") ||

    (first === "NORTH_WEST" && second === "SOUTH_EAST") ||
    (first === "SOUTH_EAST" && second === "NORTH_WEST")
  );
}


/**
 * Liefert den Port einer Verbindung, der NICHT
 * der gemeinsame Weichenport ist.
 */
function getOuterPort(
  connection,
  commonPort
) {
  if (connection.first === commonPort) {
    return connection.second;
  }

  if (connection.second === commonPort) {
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
 * Das ist der Anschluss, den Geradeaus- und
 * Abzweigverbindung gemeinsam haben.
 */
function findCommonPort(
  straightConnection,
  branchConnection
) {
  if (
    straightConnection.first === branchConnection.first ||
    straightConnection.first === branchConnection.second
  ) {
    return straightConnection.first;
  }

  if (
    straightConnection.second === branchConnection.first ||
    straightConnection.second === branchConnection.second
  ) {
    return straightConnection.second;
  }

  return null;
}


/**
 * Erzeugt die Geometrie eines Weichenarms.
 *
 * Der Ursprung ist jetzt NICHT mehr die Mitte der Zelle.
 *
 * Stattdessen beginnt der Arm exakt am gemeinsamen
 * Anschluss der Weiche.
 */
function getArmGeometry(
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


  /*
   * Der tatsächliche Ursprung der Weiche.
   *
   * Das ist der Anschluss, an dem sich Geradeaus-
   * und Abzweigverbindung treffen.
   */
  const origin =
    getPortPosition(
      commonPort,
      size
    );


  /*
   * Der äußere Anschluss des jeweiligen Arms.
   */
  const outer =
    getPortPosition(
      outerPort,
      size
    );


  /*
   * Richtungsvektor vom Ursprung zum äußeren Anschluss.
   */
  const dx =
    outer.x - origin.x;

  const dy =
    outer.y - origin.y;


  const length =
    Math.sqrt(
      dx * dx +
      dy * dy
    );


  if (length === 0) {
    return null;
  }


  /*
   * Normalisierte Richtung entlang des Arms.
   */
  const alongX =
    dx / length;

  const alongY =
    dy / length;


  /*
   * Senkrechter Vektor zum Arm.
   *
   * Der wird aktuell noch nicht für die Position benötigt,
   * ist aber Bestandteil der Geometrie und kann später für
   * einen seitlichen Indicator-Versatz verwendet werden.
   */
  const perpendicularX =
    -alongY;

  const perpendicularY =
    alongX;


  /*
   * Winkel des tatsächlichen Arms.
   */
  const armAngle =
    Math.atan2(
      alongY,
      alongX
    ) *
    180 /
    Math.PI;


  return {
    originX: origin.x,
    originY: origin.y,

    outerX: outer.x,
    outerY: outer.y,

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
 * WICHTIG:
 *
 * Die Position wird jetzt vom gemeinsamen
 * Weichenursprung aus berechnet.
 *
 * position:
 *
 *   0.0 = Weichenursprung
 *   0.5 = Mitte des Arms
 *   1.0 = äußerer Anschluss
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


  /*
   * Rotation relativ zur tatsächlichen Richtung
   * des Weichenarms.
   */
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
      width={INDICATOR_LENGTH}
      height={INDICATOR_WIDTH}
      rx={1}
      ry={1}
      transform={
        `rotate(${rotation} ${x} ${y})`
      }
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
   * SCHIENEN ZEICHNEN
   * ---------------------------------------------------------
   */

  const tracks =
    connections.map(
      (connection, index) => {
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


        const d = `
          M ${first.x} ${first.y}
          L ${second.x} ${second.y}
        `;


        return (
          <TrackPath
            key={index}
            d={d}
          />
        );
      }
    );


  /*
   * Ohne Zustand kein Indicator.
   */
  if (!turnoutState) {
    return (
      <>
        {tracks}
      </>
    );
  }


  /*
   * ---------------------------------------------------------
   * GERADEAUSVERBINDUNG
   * ---------------------------------------------------------
   */

  const straightConnection =
    findStraightConnection(
      connections
    );


  if (!straightConnection) {
    return (
      <>
        {tracks}
      </>
    );
  }


  /*
   * ---------------------------------------------------------
   * ABZWEIGVERBINDUNG
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
        {tracks}
      </>
    );
  }


  /*
   * ---------------------------------------------------------
   * WEICHENURSPRUNG
   * ---------------------------------------------------------
   *
   * Der gemeinsame Anschluss von Geradeaus und Abzweig.
   */

  const commonPort =
    findCommonPort(
      straightConnection,
      branchConnection
    );


  if (!commonPort) {
    return (
      <>
        {tracks}
      </>
    );
  }


  /*
   * ---------------------------------------------------------
   * ARM-GEOMETRIE
   * ---------------------------------------------------------
   */

  const straightArm =
    getArmGeometry(
      straightConnection,
      commonPort,
      size
    );


  const branchArm =
    getArmGeometry(
      branchConnection,
      commonPort,
      size
    );


  if (
    !straightArm ||
    !branchArm
  ) {
    return (
      <>
        {tracks}
      </>
    );
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
      ? turnoutState === "RIGHT"
      : turnoutState === "LEFT";


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
   * INDICATOR BERECHNEN
   * ---------------------------------------------------------
   */

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
      {tracks}

      <TurnoutIndicator
        x={indicator.x}
        y={indicator.y}
        rotation={indicator.rotation}
      />
    </>
  );
}
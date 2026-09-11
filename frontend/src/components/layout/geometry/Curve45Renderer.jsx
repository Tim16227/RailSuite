import {
  getPortPosition,
} from "./layoutGeometry";

import {
  TrackPath,
} from "./TrackStyle";


/**
 * Prüft, ob ein Port ein horizontaler
 * Anschluss ist.
 */
function isHorizontalPort(
  port
) {
  return (
    port === "EAST" ||
    port === "WEST"
  );
}


/**
 * Prüft, ob ein Port ein vertikaler
 * Anschluss ist.
 */
function isVerticalPort(
  port
) {
  return (
    port === "NORTH" ||
    port === "SOUTH"
  );
}


/**
 * Erzeugt die Geometrie einer 45°-Kurve.
 *
 * Die Kurve wird nicht mehr als eine
 * einfache Diagonale zwischen zwei
 * Randpunkten gezeichnet.
 *
 * Stattdessen:
 *
 * Beispiel NORTH_WEST -> EAST:
 *
 *   ┌───────────────
 *   │\
 *   │ \
 *   │  ●───────────
 *   │
 *
 * Der horizontale Anschluss läuft
 * zuerst bis zur Mitte der Kachel.
 *
 * Von dort läuft die Strecke diagonal
 * zur gegenüberliegenden Ecke.
 *
 * Dadurch beginnen Kurven und
 * angrenzende Gleise optisch sauber
 * in der Kachelmitte.
 */
function getCurvePath(
  first,
  second,
  size
) {
  const firstPosition =
    getPortPosition(
      first,
      size
    );

  const secondPosition =
    getPortPosition(
      second,
      size
    );

  const center =
    size / 2;


  /*
   * ---------------------------------------------------------
   * FALL 1
   * ---------------------------------------------------------
   *
   * Einer der Anschlüsse liegt horizontal,
   * der andere liegt diagonal in einer Ecke.
   *
   * Der horizontale Anschluss läuft zuerst
   * gerade bis zur Mitte.
   */

  if (
    isHorizontalPort(first) &&
    !isHorizontalPort(second)
  ) {
    return `
      M ${firstPosition.x}
        ${firstPosition.y}

      L ${center}
        ${firstPosition.y}

      L ${secondPosition.x}
        ${secondPosition.y}
    `;
  }


  if (
    isHorizontalPort(second) &&
    !isHorizontalPort(first)
  ) {
    return `
      M ${secondPosition.x}
        ${secondPosition.y}

      L ${center}
        ${secondPosition.y}

      L ${firstPosition.x}
        ${firstPosition.y}
    `;
  }


  /*
   * ---------------------------------------------------------
   * FALL 2
   * ---------------------------------------------------------
   *
   * Einer der Anschlüsse liegt vertikal,
   * der andere liegt diagonal in einer Ecke.
   *
   * Der vertikale Anschluss läuft zuerst
   * gerade bis zur Mitte.
   */

  if (
    isVerticalPort(first) &&
    !isVerticalPort(second)
  ) {
    return `
      M ${firstPosition.x}
        ${firstPosition.y}

      L ${firstPosition.x}
        ${center}

      L ${secondPosition.x}
        ${secondPosition.y}
    `;
  }


  if (
    isVerticalPort(second) &&
    !isVerticalPort(first)
  ) {
    return `
      M ${secondPosition.x}
        ${secondPosition.y}

      L ${secondPosition.x}
        ${center}

      L ${firstPosition.x}
        ${firstPosition.y}
    `;
  }


  /*
   * ---------------------------------------------------------
   * FALL 3
   * ---------------------------------------------------------
   *
   * Sicherheitsfallback.
   *
   * Sollte die Geometrie später erweitert
   * werden, bleibt die Darstellung trotzdem
   * funktionsfähig.
   */

  return `
    M ${firstPosition.x}
      ${firstPosition.y}

    L ${secondPosition.x}
      ${secondPosition.y}
  `;
}


export function Curve45Renderer({
  connection,
  size,
}) {
  if (
    !connection ||
    !connection.first ||
    !connection.second
  ) {
    return null;
  }


  const d =
    getCurvePath(
      connection.first,
      connection.second,
      size
    );


  return (
    <TrackPath
      d={d}
    />
  );
}
import {
  getPortPosition,
} from "./layoutGeometry";

import {
  TrackPath,
} from "./TrackStyle";

export function Curve90Renderer({
  connections = [],
  connection,
  size,
}) {
  const curveConnections =
    connections.length > 0
      ? connections
      : connection
        ? [connection]
        : [];

  return (
    <>
      {curveConnections.map(
        (currentConnection, index) => {
          const start =
            getPortPosition(
              currentConnection.first,
              size
            );

          const end =
            getPortPosition(
              currentConnection.second,
              size
            );

          const control =
            getControlPoint(
              currentConnection.first,
              currentConnection.second,
              size
            );

          return (
            <TrackPath
              key={index}
              d={
                `M ${start.x} ${start.y} ` +
                `Q ${control.x} ${control.y} ` +
                `${end.x} ${end.y}`
              }
            />
          );
        }
      )}
    </>
  );
}

function getControlPoint(
  first,
  second,
  size
) {
  const center =
    size / 2;

  /*
   * Die Kurve wird über den Mittelpunkt
   * der Zelle geführt.
   *
   * Die eigentliche Orientierung der
   * Kurve kommt aus den beiden Ports.
   */
  if (
    (
      first === "NORTH" &&
      second === "EAST"
    ) ||
    (
      first === "EAST" &&
      second === "NORTH"
    )
  ) {
    return {
      x: center,
      y: center,
    };
  }

  if (
    (
      first === "EAST" &&
      second === "SOUTH"
    ) ||
    (
      first === "SOUTH" &&
      second === "EAST"
    )
  ) {
    return {
      x: center,
      y: center,
    };
  }

  if (
    (
      first === "SOUTH" &&
      second === "WEST"
    ) ||
    (
      first === "WEST" &&
      second === "SOUTH"
    )
  ) {
    return {
      x: center,
      y: center,
    };
  }

  if (
    (
      first === "WEST" &&
      second === "NORTH"
    ) ||
    (
      first === "NORTH" &&
      second === "WEST"
    )
  ) {
    return {
      x: center,
      y: center,
    };
  }

  return {
    x: center,
    y: center,
  };
}
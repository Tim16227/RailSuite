import {
  getPortPosition,
} from "./layoutGeometry";

import {
  TrackPath,
} from "./TrackStyle";

export function CrossingRenderer({
  connections,
  size,
}) {
  return (
    <>
      {connections.map(
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
      )}
    </>
  );
}
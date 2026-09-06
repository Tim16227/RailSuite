import {
  getPortPosition,
} from "./layoutGeometry";

import {
  TrackPath,
} from "./TrackStyle";

export function StraightRenderer({
  connection,
  size,
}) {
  const first = getPortPosition(
    connection.first,
    size
  );

  const second = getPortPosition(
    connection.second,
    size
  );

  const d = `
    M ${first.x} ${first.y}
    L ${second.x} ${second.y}
  `;

  return <TrackPath d={d} />;
}
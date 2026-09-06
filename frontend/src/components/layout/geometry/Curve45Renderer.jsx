import {
  getPortPosition,
} from "./layoutGeometry";

import {
  TrackPath,
} from "./TrackStyle";

export function Curve45Renderer({
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

  const controlX =
    (first.x + second.x) / 2;

  const controlY =
    (first.y + second.y) / 2;

  const d = `
    M ${first.x} ${first.y}
    Q ${controlX} ${controlY}
      ${second.x} ${second.y}
  `;

  return <TrackPath d={d} />;
}
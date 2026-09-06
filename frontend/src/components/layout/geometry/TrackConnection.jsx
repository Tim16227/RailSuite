import { getPortPosition } from "./layoutGeometry";

export function TrackConnection({
  first,
  second,
  size,
}) {
  const start = getPortPosition(
    first,
    size
  );

  const end = getPortPosition(
    second,
    size
  );

  return (
    <line
      x1={start.x}
      y1={start.y}
      x2={end.x}
      y2={end.y}
      stroke="currentColor"
      strokeWidth={6}
      strokeLinecap="round"
    />
  );
}
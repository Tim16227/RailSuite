export const TRACK_WIDTH = 6;

export function TrackPath({
  d,
}) {
  return (
    <path
      d={d}
      fill="none"
      stroke="currentColor"
      strokeWidth={TRACK_WIDTH}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  );
}
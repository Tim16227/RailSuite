import { TrackElementRenderer } from "./geometry/TrackElementRenderer";

export function LayoutCell({
  x,
  y,
  cell,
  size,
  onClick,
}) {
  return (
    <div
      className="layout-cell"
      onClick={() => onClick(x, y)}
      style={{
        width: size,
        height: size,
      }}
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
      >
        {cell && (
          <TrackElementRenderer
            cell={cell}
            size={size}
          />
        )}
      </svg>
    </div>
  );
}
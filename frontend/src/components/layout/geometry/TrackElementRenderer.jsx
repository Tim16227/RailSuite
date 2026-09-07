import {
  LayoutElementType,
} from "../../../models/layout";

import {
  StraightRenderer,
} from "./StraightRenderer";

import {
  Curve45Renderer,
} from "./Curve45Renderer";

import {
  Curve90Renderer,
} from "./Curve90Renderer";

import {
  TurnoutRenderer,
} from "./TurnoutRenderer";

import {
  CrossingRenderer,
} from "./CrossingRenderer";


export function TrackElementRenderer({
  cell,
  size,
}) {
  switch (cell.elementType) {
    case LayoutElementType.STRAIGHT:
      return (
        <StraightRenderer
          connection={
            cell.connections[0]
          }
          size={size}
        />
      );

    case LayoutElementType.CURVE_45:
      return (
        <Curve45Renderer
          connection={
            cell.connections[0]
          }
          size={size}
        />
      );

    case LayoutElementType.CURVE_90:
      return (
        <Curve90Renderer
          connection={
            cell.connections[0]
          }
          size={size}
        />
      );

    case LayoutElementType.TURNOUT:
      return (
        <TurnoutRenderer
          connections={
            cell.connections
          }
          size={size}
          turnoutState={
            cell.turnoutState
          }
        />
      );

    case LayoutElementType.CROSSING:
      return (
        <CrossingRenderer
          connections={
            cell.connections
          }
          size={size}
        />
      );

    default:
      return null;
  }
}
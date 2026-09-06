import {
  LayoutElementType,
  LayoutOrientation,
} from "../../../models/layout";

import {
  LayoutPort,
} from "./layoutGeometry";

const BASE_GEOMETRY = {
  [LayoutElementType.STRAIGHT]: {
    ports: [
      LayoutPort.NORTH,
      LayoutPort.SOUTH,
    ],

    connections: [
      [
        LayoutPort.NORTH,
        LayoutPort.SOUTH,
      ],
    ],
  },

  [LayoutElementType.CURVE_45]: {
    ports: [
      LayoutPort.NORTH_WEST,
      LayoutPort.EAST,
    ],

    connections: [
      [
        LayoutPort.NORTH_WEST,
        LayoutPort.EAST,
      ],
    ],
  },

  [LayoutElementType.CURVE_90]: {
    ports: [
      LayoutPort.NORTH,
      LayoutPort.EAST,
    ],

    connections: [
      [
        LayoutPort.NORTH,
        LayoutPort.EAST,
      ],
    ],
  },

  [LayoutElementType.TURNOUT]: {
    ports: [
      LayoutPort.WEST,
      LayoutPort.EAST,
      LayoutPort.SOUTH_EAST,
    ],

    connections: [
      [
        LayoutPort.WEST,
        LayoutPort.EAST,
      ],
      [
        LayoutPort.WEST,
        LayoutPort.SOUTH_EAST,
      ],
    ],
  },

  [LayoutElementType.CROSSING]: {
    ports: [
      LayoutPort.NORTH,
      LayoutPort.EAST,
      LayoutPort.SOUTH,
      LayoutPort.WEST,
    ],

    connections: [
      [
        LayoutPort.NORTH,
        LayoutPort.SOUTH,
      ],
      [
        LayoutPort.WEST,
        LayoutPort.EAST,
      ],
    ],
  },
};
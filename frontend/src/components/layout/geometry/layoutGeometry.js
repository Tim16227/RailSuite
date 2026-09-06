export const LayoutPort = {
  NORTH: "NORTH",
  NORTH_EAST: "NORTH_EAST",
  EAST: "EAST",
  SOUTH_EAST: "SOUTH_EAST",
  SOUTH: "SOUTH",
  SOUTH_WEST: "SOUTH_WEST",
  WEST: "WEST",
  NORTH_WEST: "NORTH_WEST",
};

const PORT_POSITION = {
  NORTH: {
    x: 0.5,
    y: 0,
  },

  NORTH_EAST: {
    x: 1,
    y: 0,
  },

  EAST: {
    x: 1,
    y: 0.5,
  },

  SOUTH_EAST: {
    x: 1,
    y: 1,
  },

  SOUTH: {
    x: 0.5,
    y: 1,
  },

  SOUTH_WEST: {
    x: 0,
    y: 1,
  },

  WEST: {
    x: 0,
    y: 0.5,
  },

  NORTH_WEST: {
    x: 0,
    y: 0,
  },
};

export function getPortPosition(port, size) {
  const position = PORT_POSITION[port];

  if (!position) {
    throw new Error(
      `Unknown layout port: ${port}`
    );
  }

  return {
    x: position.x * size,
    y: position.y * size,
  };
}
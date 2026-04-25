/**
 * Game configuration constants
 */

export const CANVAS_CONFIG = {
  DEFAULT_WIDTH: 800,
  DEFAULT_HEIGHT: 600,
  BACKGROUND_COLOR: '#70c5ce',
  TARGET_FPS: 60,
} as const;

export const GAME_CONFIG = {
  CANVAS: {
    WIDTH: 800,
    HEIGHT: 600,
    BACKGROUND_COLOR: '#70c5ce',
  },
  PERFORMANCE: {
    TARGET_FPS: 60,
    MAX_DELTA_TIME: 100, // Maximum time between frames in ms
  },
  PHYSICS: {
    GRAVITY: 0.0008, // Gravity acceleration in pixels/ms²
    FLAP_FORCE: -0.45, // Upward velocity applied on flap in pixels/ms
    TERMINAL_VELOCITY: 0.8, // Maximum downward velocity in pixels/ms
    HORIZONTAL_SPEED: 0.2, // Constant horizontal movement speed in pixels/ms
  },
  BIRD: {
    START_X: 150,
    START_Y: 300,
    WIDTH: 34,
    HEIGHT: 24,
    FLAP_FORCE: -0.45,
    MAX_ROTATION: 90,
  },
  OBSTACLES: {
    WIDTH: 80,
    GAP_SIZE: 150,
    SPAWN_INTERVAL: 2000,
    SPEED: 0.15,
    MIN_GAP_Y: 100,
    MAX_GAP_Y: 500,
  },
} as const;

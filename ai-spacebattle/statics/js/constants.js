const CONSTANTS = {
  MAX_BUFFER_LENGTH: 5,
  // WIDTH: 2000,
  // HEIGHT: 2000,
  // CANVAS_WIDTH: 360,
  // CANVAS_HEIGHT: 640,
  // NB_PLANETS: 35,
  // NB_ASTEROID: 60,
  // PLANET_BULLET_COUNT: 3,
  // MAX_PLAYER: 40,
  TRAINING: true,
  WIDTH: 800,
  HEIGHT: 800,
  CANVAS_WIDTH: 400,
  CANVAS_HEIGHT: 400,
  NB_PLANETS: 5,
  NB_ASTEROID: 15,
  PLANET_BULLET_COUNT: 3,
  MAX_PLAYER: 1,
  AIR_RESISTENCE: 0.95,
  TIME: 250,
  SEND_TIME: 40,

  VISION: {
    WIDTH: 20,
    TOP: 10,
    BOTTOM: 3,
    SIDE: 4
  },

  ASTEROID_FIXED: false,
  FRAME_RATE: 30,
  MIN_MOVE_DISTANCE: 30,
  MIN_MOVE_PAS: 1,
  LATENCY: 5,
  BACKGROUND: 0,
  SHIP_SPEED: 2,
  SHIP_SIZE: 15,
  BULLET_SPEED: 10,
  BULLET_LIFE: 30,
  BULLET_COUNT: 3,
  SHIP_MAX_ACC: 2,
  BULLET_RADIUS: 5,
  PLANET_MIN_RADIUS: 75,
  PLANET_MAX_RADIUS: 120,
  ASTEROID_RADIUS: 15,
  ASTEROID_MAX_SPEED: 2,
  MAX_LIFE: 100,
  PARTICLE_LIFE: 255,
  MINIMAP_SCALE: 12,
  BONUSES_RADIUS: 3,
  DIFFICULTY: 1,
  SHIP_SEE_SHIP: true,
  TURN_ANGLE: 0.05,
  BOOST_FORCE: 0.2,
  BREAK_RESISTENCE: 0.15,
  TARGET_FRONT: 150,
  TARGET_TURN_ANGLE: 0.02,
  TARGET_BOOST_FORCE: 0.50
}

if (typeof module !== 'undefined') module.exports = CONSTANTS

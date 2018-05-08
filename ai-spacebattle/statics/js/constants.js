const CONSTANTS = {
  MAX_BUFFER_LENGTH: 5,
  WIDTH: 1200,
  HEIGHT: 1600,
  CANVAS_WIDTH: 360,
  CANVAS_HEIGHT: 640,
  FRAME_RATE: 35,
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
  NB_PLANETS: 15,
  NB_ASTEROID: 30,
  PLANET_MIN_RADIUS: 75,
  PLANET_MAX_RADIUS: 120,
  ASTEROID_RADIUS: 15,
  MAX_LIFE: 100,
  PARTICLE_LIFE: 255
}

if (typeof module !== 'undefined') module.exports = CONSTANTS

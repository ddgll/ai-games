const Maths = require('../server/maths')
const CONSTANTS = require('../statics/js/constants')

const ACTIONS_STRING = [
  'up',
  'upright',
  'upleft',
  'upfire',
  'fire'
]

module.exports = class Target {
  constructor (x, y, r) {
    this.setShipPosition(x, y, r)
    this.x = (CONSTANTS.CANVAS_WIDTH / 2) + 100
    this.y =  (CONSTANTS.CANVAS_HEIGHT / 2)
    this.vel = { x: 0, y: 0 }
    this.acc = { x: 0, y: 0 }
    this.rotation = 0
    this.force = 1
  }

  setShipPosition (x, y, r, speed = 150) {
    let distance
    const xCenter = CONSTANTS.CANVAS_WIDTH / 2
    const yCenter = CONSTANTS.CANVAS_HEIGHT / 2
    if (x < CONSTANTS.CANVAS_WIDTH / 2) this.xCenter = x
    if (x > CONSTANTS.WIDTH - CONSTANTS.CANVAS_WIDTH / 2) this.xCenter = CONSTANTS.CANVAS_WIDTH - CONSTANTS.WIDTH + x
    if (y < CONSTANTS.CANVAS_HEIGHT / 2) this.yCenter = y
    if (y > CONSTANTS.HEIGHT - CONSTANTS.CANVAS_HEIGHT / 2) this.yCenter = CONSTANTS.CANVAS_HEIGHT - CONSTANTS.HEIGHT + y
    this.xCenter = xCenter
    this.yCenter = yCenter
    const length = Maths.magnitude(this.xCenter, this.yCenter)
    const vX = Math.cos(r) * 150
    const vY = Math.sin(r) * 150
    this.x = this.xCenter + vX
    this.y = this.yCenter + vY
    this.rotation = r
    this.fire = false
  }

  boost (force) {
    this.force = CONSTANTS.BOOST_FORCE * force
  }
  
  break () {
    this.acc.x -= Math.cos(this.rotation) * CONSTANTS.BREAK_RESISTENCE
    this.acc.y -= Math.sin(this.rotation) * CONSTANTS.BREAK_RESISTENCE
  }
  
  turn (angle) {
    this.rotation = CONSTANTS.TURN_ANGLE * angle
  }

  setAction ([ force, rotation, shoot ]) {
    if (shoot > 0) this.fire = true
    this.vel = { x: 0, y: 0 }
    this.turn(rotation)
    this.boost(force)
  }

  action () {
    // this.vel.x *= CONSTANTS.AIR_RESISTENCE
    // this.vel.y *= CONSTANTS.AIR_RESISTENCE
    // if (Maths.magnitude(this.vel.x, this.vel.y) > (CONSTANTS.SHIP_SPEED)) {
    //   this.vel = Maths.magnitude(this.vel.x, this.vel.y, CONSTANTS.SHIP_SPEED)
    // }

    const v = this.rotate(this.x * this.force, this.y * this.force, this.rotation)
    this.x = this.xCenter + v.x
    this.y = this.yCenter + v.y

    // console.log(this.force, this.rotation, this.x, this.y, v.x, v.y)

    if (this.x > this.xCenter + CONSTANTS.CANVAS_WIDTH / 2) this.x = this.xCenter + CONSTANTS.CANVAS_WIDTH / 2
    if (this.x < this.xCenter - CONSTANTS.CANVAS_WIDTH / 2) this.x = this.xCenter - CONSTANTS.CANVAS_WIDTH / 2
    if (this.y > this.yCenter + CONSTANTS.CANVAS_HEIGHT / 2) this.y = this.yCenter + CONSTANTS.CANVAS_HEIGHT / 2
    if (this.y < this.yCenter - CONSTANTS.CANVAS_HEIGHT / 2) this.y = this.yCenter - CONSTANTS.CANVAS_HEIGHT / 2

    const result = [this.x, this.y, this.fire]
    this.fire = false
    return result
  }

  rotate(x, y, angle) {
    // return { x: cx, y: cy }
    const cos = Math.cos(angle),
        sin = Math.sin(angle),
        nx = (cos * (x)) + (sin * (y)),
        ny = (cos * (y)) - (sin * (x));
    return { x: nx, y: ny };
  }

  oneHotDecode (zeros){
    const max = Math.max.apply(null, zeros)
    const index = zeros.indexOf(max)
    return ACTIONS_STRING[index]
  }
}

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
    this.vel = { x: 0, y: 0 }
    this.label = null
  }

  setShipPosition (x, y, r, speed = 150) {
    const length = Maths.magnitude(x, y)
    const vX = Math.cos(r) * 150
    const vY = Math.sin(r) * 150
    this.x = x + vX
    this.y = y + vY
    this.rotation = r
    this.fire = false
  }

  boost () {
    this.vel.x += Math.cos(this.rotation) * CONSTANTS.BOOST_FORCE
    this.vel.y += Math.sin(this.rotation) * CONSTANTS.BOOST_FORCE
  }
  
  break () {
    this.vel.x -= Math.cos(this.rotation) * CONSTANTS.BREAK_RESISTENCE
    this.vel.y -= Math.sin(this.rotation) * CONSTANTS.BREAK_RESISTENCE
  }
  
  turn (angle) {
    this.rotation += angle
    this.rotation = this.rotation % (2 * Math.PI)
  }

  shoot () {
    this.fire = true
  }

  setOutputs (outputs) {
    this.label = this.oneHotDecode(outputs)
  }

  action (x, y, r) {
    if (!this.label) return
    this.x = x
    this.y = y
    this.rotation
    this.fire = false
    this.vel.x *= CONSTANTS.AIR_RESISTENCE
    this.vel.y *= CONSTANTS.AIR_RESISTENCE
    switch (this.label) {
      case 'up':
        this.setShipPosition(x, y, r)
        break;
      case 'upleft':
        this.setShipPosition(x, y, r - CONSTANTS.TURN_ANGLE)
        break;
      case 'upright':
        this.setShipPosition(x, y, r - CONSTANTS.TURN_ANGLE)
        break;
      case 'upfire':
        this.setShipPosition(x, y, r)
        this.shoot()
        break;
      case 'fire':
        this.shoot()
        break;
    }
    if (Maths.magnitude(this.vel.x, this.vel.y) > (CONSTANTS.SHIP_SPEED)) {
      this.vel = Maths.magnitude(this.vel.x, this.vel.y, CONSTANTS.SHIP_SPEED)
    }
    this.x += this.vel.x
    this.y += this.vel.y
  }

  oneHotDecode (zeros){
    const max = Math.max.apply(null, zeros)
    const index = zeros.indexOf(max)
    return ACTIONS_STRING[index]
  }
}

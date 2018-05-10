const Element = require('./element')
const Maths = require('../maths')
const Bullet = require('./bullet')
const CONSTANTS = require('../../statics/js/constants')

module.exports = class Asteroid extends Element {
  constructor (id, x, y, planets, options) {
    super(id, x, y, options)
    this.dead = false
    this.radius = CONSTANTS.ASTEROID_RADIUS
    this.x = x
    this.y = y
    this.mass = CONSTANTS.ASTEROID_RADIUS * 100
    this.total = Math.floor(Maths.randomInt(4, 6))
    this.vertexes = []
    for (let i = 0, a, x, y, r; i < this.total; i++) {
      a = Maths.map(i, 0, this.total, 0, Math.PI * 2)
      r = this.radius + Maths.randomInt(-10, 10)
      x = Math.round(r * Math.cos(a))
      y = Math.round(r * Math.sin(a))
      this.vertexes.push([x, y])
    }

    for (let i = 0, l = planets.length, p; i < l; i++) {
      p = planets[i]
      this.addGravitation({ x: p.x, y: p.y, mass: p.mass, repulse: true })
    }

    do {
      this.vel = { x: Math.random() * (Maths.randomInt(1, 4) - 3), y: Math.random() * (Maths.randomInt(1, 4) - 3) }
    } while (this.vel.x === 0 && this.vel.y === 0)
  }

  update (ships) {
    super.update()
    for (let i = 0, l = ships.length, x, y, s; i < l; i++) {
      s = ships[i]
      x = s.x
      y = s.y
      if (this.shipCollide(x, y, CONSTANTS.SHIP_SIZE)) {
        s.setCollide(5, 2)
        break
      }
    }
    if (Maths.magnitude(this.vel.x, this.vel.y) > CONSTANTS.ASTEROID_MAX_SPEED) {
      const tmp = Maths.magnitude(this.vel.x, this.vel.y, CONSTANTS.ASTEROID_MAX_SPEED)
      this.vel = Maths.magnitude(this.vel.x, this.vel.y, CONSTANTS.ASTEROID_MAX_SPEED)
    }
    this.x += this.vel.x
    this.y += this.vel.y
    if (this.x > (CONSTANTS.WIDTH + this.radius)) {
      this.x = -this.radius
    } else if (this.x < -this.radius) {
      this.x = CONSTANTS.WIDTH + this.radius
    }
    if (this.y > (CONSTANTS.HEIGHT + this.radius)) {
      this.y = -this.radius
    } else if (this.y < -this.radius) {
      this.y = CONSTANTS.HEIGHT + this.radius
    }
    while (this.vel.x === 0 && this.vel.y === 0) {
      this.vel = { x: Math.random() * (Maths.randomInt(1, 4) - 3), y: Math.random() * (Maths.randomInt(1, 4) - 3) }
    }
  }

  shipCollide (x, y, r) {
    const x1 = this.x-r/2,
          y1 = this.y,
          x2 = this.x + r/2,
          y2 = this.y,
          x3 = this.x,
          y3 = this.y + r

    return Maths.circlePointCollision(x1, y1, x, y, this.radius) ||
            Maths.circlePointCollision(x2, y2, x, y, this.radius) ||
            Maths.circlePointCollision(x3, y3, x, y, this.radius)
  }
}
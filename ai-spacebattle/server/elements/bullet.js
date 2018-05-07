const Element = require('./element')
const Maths = require('../maths')
const CONSTANTS = require('../../statics/js/constants')

module.exports = class Bullet extends Element {
  constructor (id, owner, options) {
    super(id, 0, 0, options)
    this.life = 0
    this.r = CONSTANTS.BULLET_RADIUS
    this.owner = owner
    this.speed = CONSTANTS.BULLET_SPEED
    this.target = null
    this.vel = { x: 0, y: 0 }
  }

  shoot (x, y, a) {
    if (this.life === 0)
    this.life = CONSTANTS.BULLET_LIFE
    this.x = x
    this.y = y
    this.rotation = a
    this.vel.x = Math.cos(a) * this.speed
    this.vel.y = Math.sin(a) * this.speed
  }

  searchShoot (id, x, y) {
    if (this.life === 0)
    this.x = x
    this.y = y
    this.speed = CONSTANTS.BULLET_SPEED / 2.5
    this.life = CONSTANTS.BULLET_LIFE * 3
    this.target = id
  }

  dead () {
    return this.life <= 0
  }

  update (planets, ships) {
    if (!this.life) return
    this.life--
    if (this.target !== null) {
      const ship = ships.find(s => s.id === this.target)
      if (ship && !ship.dead) {
        const a = Maths.angleBetween(this.x, this.y, ship.x, ship.y)
        this.vel.x = Math.cos(a) * this.speed / 2
        this.vel.y = Math.sin(a) * this.speed / 2
      }
    }
    this.x += this.vel.x
    this.y += this.vel.y
    
    if (this.worldCollide()) this.life = 0

    for (let i = 0, l = planets.length, x, y, r, p; i < l; i++) {
      p = planets[i]
      x = p.x
      y = p.y
      r = p.radius / 2
      if (this.circleCollide(x, y, r)) {
        this.life = 0
        break
      }
    }
    for (let i = 0, l = ships.length, x, y, s; i < l; i++) {
      s = ships[i]
      if ('s' + s.id === this.owner) continue
      x = s.x
      y = s.y
      if (this.shipCollide(x, y, CONSTANTS.SHIP_SIZE)) {
        this.life = 0
        s.life -= 10
        s.collide = 5
        break
      } else {
        // console.log('SHIP NOT COLLLLLIIIIIDE !!!!!')
      }
    }
    if (this.life < 0) this.life = 0
  }



  circleCollide (x, y, r) {
    const d = Maths.distance(x, y, this.x, this.y)
    return d < this.r + r
  }

  worldCollide () {
    if (this.x - this.r < this.xMin) return true
    if (this.x > this.xMax - this.r) return true
    if (this.y - this.r < this.yMin) return true
    if (this.y > this.yMax - this.r) return true
  }

  shipCollide (x, y, size) {
    const x1 = x-size/2,
          y1 = y,
          x2 = x + size/2,
          y2 = y,
          x3 = x,
          y3 = y + size
    return Maths.collidePointTriangle (this.x, this.y, x1, y1, x2, y2, x3, y3)
  }
}
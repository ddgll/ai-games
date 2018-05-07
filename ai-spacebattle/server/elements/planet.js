const Element = require('./element')
const Maths = require('../maths')
const Bullet = require('./bullet')
const CONSTANTS = require('../../statics/js/constants')

module.exports = class Planet extends Element {
  constructor (id, x, y, r, options) {
    super(id, x, y, options)
    this.dead = false
    this.owner = null
    this.challenger = null
    this.radius = r
    this.x = x
    this.y = y
    this.mass = r * 75

    console.log('Planet ', id, ' mass:', this.mass)

    this.view = r * 2

    this.btimer = 0
    this.challenge = 0

    this.bullets = []
    for (let j = 1, b; j <= CONSTANTS.BULLET_COUNT; j++) {
      b = new Bullet(id + '-p-' + j, 'p' + id)
      this.bullets.push(b)
    }
  }

  shoot (target) {
    if (this.dead) return
    const bullet = this.bullets.find(b => b.dead())
    if (bullet && this.btimer === 0) {
      const a = Maths.angleBetween(this.x, this.y, target.x, target.y)
      const x = this.x + (this.radius / 2 + CONSTANTS.BULLET_RADIUS) * Math.cos(a)
      const y = this.y + (this.radius / 2 + CONSTANTS.BULLET_RADIUS) * Math.sin(a)
      bullet.searchShoot(target.id, x, y)
      this.btimer = CONSTANTS.BULLET_LIFE * 1.5
    }
    return false
  }

  update (planets, ships) {
    let minimum = Infinity, target = null, nb = 0
    for (let i = 0, l = ships.length, x, y, s, d; i < l; i++) {
      s = ships[i]
      if (s.id === this.owner) continue
      x = s.x
      y = s.y
      d = Maths.distance(this.x, this.y, x, y)
      if (d < this.view) {
        nb++
        if (d < minimum) {
          minimum = d
          target = s
        }
      }
    }
    if (this.btimer > 0) this.btimer--
    if (target !== null) {
      this.shoot(target)
      if (nb === 1) {
        if (this.challenger !== target.id) {
          this.challenger = target.id
          this.challenge = 0
        } else {
          this.challenge++
        }
      }
    }
    if (this.challenge == 100) {
      this.owner = this.challenger
      this.ownership = ships.find(s => s.id === this.owner)
      this.challenger = null
      this.challenge = 0
    }
    for (let i = 0, l = this.bullets.length, b; i < l; i++) {
      this.bullets[i].update(planets, ships)
    }
    if (this.ownership) this.ownership.score += 1
  }
}
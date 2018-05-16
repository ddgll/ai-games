'use strict';

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

    // console.log('Planet ', id, ' mass:', this.mass)

    this.view = r * 2

    this.btimer = 0
    this.challenge = 0

    this.bullets = []
    for (let j = 1, b; j <= CONSTANTS.PLANET_BULLET_COUNT; j++) {
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

  update (planets, ships, asteroids) {
    let minimum = Infinity, target = null, nb = 0, challenger = null
    for (let i = 0, l = ships.length, x, y, s, d; i < l; i++) {
      s = ships[i]
      x = s.x
      y = s.y
      d = Maths.distance(this.x, this.y, x, y)
      if (d < this.view) {
        if (d < (this.radius / 2)) {
          if (this.x + this.radius + 20 > CONSTANTS.WIDTH) {
            s.x = this.x - this.radius - 20
          } else {
            s.x = this.x + this.radius + 20
          }
        }
        if (d < minimum) {
          minimum = d
          target = s
        }
        if (d < this.view / 2) {
          if (nb === 0) challenger = s
          nb++
        }
      }
    }
    if (this.btimer > 0) this.btimer--
    if (target !== null && this.owner !== target.id) {
      this.shoot(target)
    }
    if (nb === 1 || (!CONSTANTS.SHIP_SEE_SHIP && nb >= 1)) {
      if (this.challenge > 0 && this.owner === challenger.id) {
        challenger.score++
        this.challenge--
      } else if (this.challenger !== challenger.id) {
        this.challenger = challenger.id
        this.challenge = 0
      } else if (challenger.collide === 0 && challenger.god === 0) {
        challenger.score++
        this.challenge++
      }
    }
    if (this.challenge == 100) {
      this.owner = this.challenger
      this.ownership = ships.find(s => s.id === this.owner)
      for (let i = 0, l = this.bullets.length, b; i < l; i++) {
        this.bullets[i].owner = 's' + this.owner
      }
      this.challenger = null
      this.challenge = 0
    }
    for (let i = 0, l = this.bullets.length, b; i < l; i++) {
      this.bullets[i].update(planets, ships, asteroids)
    }
    if (this.ownership && !this.ownership.brain) this.ownership.score += .1
  }
}
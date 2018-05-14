'use strict';
const ACTIONS_STRING = [
  'up',
  'upright',
  'upleft',
  'right',
  'left',
  'down',
  'downright',
  'downleft',
  'fire'
]
const clear = require('clear')
const Element = require('./element')
const Maths = require('../maths')
const Bullet = require('./Bullet')
const CONSTANTS = require('../../statics/js/constants')

module.exports = class Ship extends Element {
  constructor (id, x, y, name, options, brain) {
    if (brain) {
      super('bot-' + id, x, y, options)
    } else {
      super(id, x, y, options)
    }
    this.dead = false
    this.speed = CONSTANTS.SHIP_SPEED
    this.maxAcceleration = CONSTANTS.SHIP_MAX_ACC
    this.minMoveDistance = CONSTANTS.MIN_MOVE_DISTANCE
    this.target = null
    this.score = 0

    this.nbDist = 0

    this.brain = brain
    this.seight = CONSTANTS.PLANET_MAX_RADIUS
    this.nbSensors = 5
    this.best = 0
    this.bestFrames = 0
    this.distance = 0
    this.xCheck = this.x * 1
    this.yCheck = this.y * 1
    this.wrongCheck = 0
    this.oldAngle = 0
    this.angleFrames = 0

    this.maxInputsValues = 0
    for(let i = 0; i < this.nbSensors; i++) {
      this.maxInputsValues += (this.nbSensors - i - 1) * 10
    }

    this.oldX = null
    this.oldY = null

    this.name = name
    this.life = CONSTANTS.MAX_LIFE
    this.size = CONSTANTS.SHIP_SIZE
    this.bullets = []
    this.frames = 0
    this.god = 0
    for (let i = 1, b; i <= CONSTANTS.BULLET_COUNT; i++) {
      b = new Bullet(id + '-s-' + i, 's' + id)
      this.bullets.push(b)
    }
    this.btimer = 0
    this.collide = 0

    this.xMin = 0 + CONSTANTS.SHIP_SIZE
    this.yMin = 0 + CONSTANTS.SHIP_SIZE
    this.xMax = CONSTANTS.WIDTH - CONSTANTS.SHIP_SIZE
    this.yMax = CONSTANTS.HEIGHT - CONSTANTS.SHIP_SIZE
  }

  oneHotEncode (type){
    const zeros = Array.apply(null, Array(ACTIONS_STRING.length)).map(Number.prototype.valueOf, 0);
    const index = ACTIONS_STRING.indexOf(type);
    zeros[index] = 1;
    return zeros;
  }

  oneHotDecode (zeros){
    const max = Math.max.apply(null, zeros);
    const index = zeros.indexOf(max);
    return ACTIONS_STRING[index];
  }

  think (planets, ships, asteroids, bonuses, bullets) {
    // return
    this.obs = this.sense(planets, ships, asteroids, bonuses, bullets)
    const vel = Math.sqrt(2) * (CONSTANTS.SHIP_SPEED*2)
    const inputs = [
      Maths.norm(this.rotation, -Math.PI * 2, Math.PI * 2), // 0
      Maths.norm(this.vel.x, -vel, vel), // 1
      Maths.norm(this.vel.y, -vel, vel), // 2
      this.collide > 0 ? 1 : 0 // 3
    ].concat(this.obs)
    // clear()
    if (inputs.length !== 60) console.log('INPUTE LENGTH !!!', inputs.length)
    let th = true
    inputs.forEach((i, idx) => {
      if (i < 0 || i > 1) {
        console.log(JSON.stringify(inputs))
        console.log('Input index', idx, 'not normaliszed', i, this.vel.x, inputs.length, this.maxInputsValues)
        th = false
      }
    })
    if (!th) return null
    const outputs = this.brain.activate(inputs)
    // console.log(JSON.stringify(inputs, null, 2), inputs.length, outputs.length)
    const label = this.oneHotDecode(outputs)
    this.action(label)
  }

  action (label) {
    // this.vel.x *= CONSTANTS.AIR_RESISTENCE
    // this.vel.y *= CONSTANTS.AIR_RESISTENCE
    switch (label) {
      case 'up':
        this.boost()
        this.turn(0)
        break;
      case 'upleft':
        this.boost()
        this.turn(-CONSTANTS.TURN_ANGLE)
        break;
      case 'upright':
        this.boost()
        this.turn(CONSTANTS.TURN_ANGLE)
        break;
      case 'left':
        this.turn(-CONSTANTS.TURN_ANGLE)
        break;
      case 'right':
        this.turn(CONSTANTS.TURN_ANGLE)
        break;
      case 'down':
        this.break()
        this.turn(0)
        break;
      case 'downRight':
        this.break()
        this.turn(CONSTANTS.TURN_ANGLE)
        break;
      case 'downLeft':
        this.break()
        this.turn(-CONSTANTS.TURN_ANGLE)
        break;
      case 'fire':
        this.shoot()
        break;
    }

    if (Maths.magnitude(this.vel.x, this.vel.y) > (CONSTANTS.SHIP_SPEED * 2)) {
      this.vel = Maths.magnitude(this.vel.x, this.vel.y, (CONSTANTS.SHIP_SPEED * 2))
    }
  }

  boost () {
    if (this.dead) return
    this.vel.x += Math.cos(this.rotation) * CONSTANTS.BOOST_FORCE
    this.vel.y += Math.sin(this.rotation) * CONSTANTS.BOOST_FORCE
  }

  break () {
    if (this.dead) return
    this.vel.x -= Math.cos(this.rotation) * CONSTANTS.BREAK_RESISTENCE
    this.vel.y -= Math.sin(this.rotation) * CONSTANTS.BREAK_RESISTENCE
  }

  turn (angle) {
    if (this.dead) return
    if (this.angleFrames > 200) {
      this.angleFrames = 0
      this.check360 = 0
    }
    this.check360 += angle
    this.rotation += angle
    if (this.check360 > 2 * Math.PI) {
      this.angleFrames = 0
      this.check360 = 0
      this.life--
    }
    this.rotation = this.rotation % (2 * Math.PI)
  }

  sense (planets, ships, asteroids, bonuses, bullets) {
    const obs = {
      planets: [],
      ships: [],
      asteroids: [],
      bullets: [],
      bonuses: []
    }
    let result = []
    const sort = (a, b) => a.d - b.d
    const reduce = (a, b) => a.concat(b)
    const vels = Math.sqrt(2) * (CONSTANTS.SHIP_SPEED*2)
    const vela = Math.sqrt(2) * (CONSTANTS.ASTEROID_MAX_SPEED*2)
    const velb = Math.sqrt(2) * (CONSTANTS.BULLET_SPEED*2)
    let d, x, y, r, an, ow, min = Infinity
    planets.forEach(p => {
      x = p.x - this.x
      y = p.y - this.y
      r = p.radius
      d = Maths.distance(0, 0, x, y)
      ow = p.owner === this.id ? 1 : p.challenger === this.id ? p.challenge / 100 : 0
      if (d < this.seight *2) obs.planets.push({
        d: d,
        data: [
        Maths.norm(x, -this.seight*2, this.seight*2), // 0 - 4
        Maths.norm(y, -this.seight*2, this.seight*2), // 1 - 5
        Maths.norm(r, CONSTANTS.PLANET_MIN_RADIUS, CONSTANTS.PLANET_MAX_RADIUS), // 2 - 6
        ow === this.id ? 1 : 0 // 3 - 7
      ]})
    })
    obs.planets.sort(sort)
    while (obs.planets.length < 2) obs.planets.push({ d: 0, data: [ 0, 0, 0, 0 ] })
    result = result.concat(obs.planets.slice(0, 2).map(d => d.data).reduce(reduce)) // 8
    if (CONSTANTS.SHIP_SEE_SHIP) {
      ships.forEach(s => {
        if (s.id === this.id) return
        x = s.x - this.x
        y = s.y - this.y
        d = Maths.distance(0, 0, x, y)
        if (d < this.seight) obs.ships.push({
          d: d,
          data: [
          Maths.norm(x, -this.seight, this.seight), // 8 - 14
          Maths.norm(y, -this.seight, this.seight), // 9 - 15
          Maths.norm(s.rotation, -Math.PI * 2, Math.PI * 2), // 10 - 16
          Maths.norm(s.vel.x, -vels, vels), // 11 - 17
          Maths.norm(s.vel.y, -vels, vels), // 12 - 18
          s.collide ? 1 : 0 // 13 - 19
        ]})
      })
      obs.ships.sort(sort)
    }
    while (obs.ships.length < 2) obs.ships.push({ d: 0, data: [ 0, 0, 0, 0, 0, 0 ] })
    result = result.concat(obs.ships.slice(0, 2).map(d => d.data).reduce(reduce)) // 10
    asteroids.forEach(a => {
      x = a.x - this.x
      y = a.y - this.y
      d = Maths.distance(0, 0, x, y)
      an = Maths.angleBetween(0, 0, x, y)
      if (d < this.seight && d < min) obs.asteroids.push({d: d, data: [
        Maths.norm(x, -this.seight, this.seight), // 20 - 24
        Maths.norm(y, -this.seight, this.seight), // 21 - 25
        Maths.norm(a.vel.x, -vela, vela), // 22 - 26
        Maths.norm(a.vel.y, -vela, vela), // 23 - 27
      ]})
    })
    obs.asteroids.sort(sort)
    while (obs.asteroids.length < 2) obs.asteroids.push({ d: 0, data: [ 0, 0, 0, 0 ] })
    result = result.concat(obs.asteroids.slice(0, 2).map(d => d.data).reduce(reduce)) // 6
    bonuses.forEach(b => {
      x = b.x - this.x
      y = b.y - this.y
      d = Maths.distance(0, 0, x, y)
      an = Maths.angleBetween(0, 0, x, y)
      if (d < this.seight) obs.bonuses.push({
        d: d,
        data: [
        Maths.norm(x, -this.seight, this.seight), // 28 - 30
        Maths.norm(y, -this.seight, this.seight) // 29 - 31
      ]})
    })
    obs.bonuses.sort(sort)
    while (obs.bonuses.length < 2) obs.bonuses.push({ d: 0, data: [ 0, 0 ] })
    result = result.concat(obs.bonuses.slice(0, 2).map(d => d.data).reduce(reduce)) // 4
    bullets.forEach(b => {
      if (b.o === 's' + this.id) return
      if (b.o && b.o[0] === 's' && !CONSTANTS.SHIP_SEE_SHIP) return
      x = b.x - this.x
      y = b.y - this.y
      d = Maths.distance(0, 0, x, y)
      an = Maths.angleBetween(0, 0, x, y)
      if (d < this.seight && b.owner !== this.id) obs.bullets.push({
        d: d,
        data: [
        Maths.norm(x, -this.seight, this.seight), // 32 - 36 - 40 - 44
        Maths.norm(y, -this.seight, this.seight), // 33 - 37 - 41 - 45
        Maths.norm(b.vx, -velb, velb), // 34 - 38 - 42 - 46
        Maths.norm(b.vy, -velb, velb), // 35 - 39 - 43 - 47
      ]})
    })
    obs.bullets.sort(sort)
    while (obs.bullets.length < 4) obs.bullets.push({ d: 0, data: [ 0, 0, 0, 0 ] })
    const zero = Maths.norm(0, -this.seight, this.seight)
    result = result.concat(obs.bullets.slice(0, 4).map(d => d.data).reduce(reduce)) // 8
    d = Maths.distance(this.x, this.y, 0, this.y)
    an = Maths.angleBetween(this.x, this.y, 0, this.y)
    if (d < this.seight) {
      result = result.concat([Maths.norm(-this.x, -this.seight, this.seight), zero]) // 48 - 49
    } else {
      result = result.concat([0, 0])
    }
    d = Maths.distance(this.x, this.y, CONSTANTS.WIDTH, this.y)
    an = Maths.angleBetween(this.x, this.y, CONSTANTS.WIDTH, this.y)
    if (d < this.seight) {
      result = result.concat([Maths.norm(CONSTANTS.WIDTH - this.x, -this.seight, this.seight), zero]) // 50 - 51
    } else {
      result = result.concat([0, 0])
    }
    d = Maths.distance(this.x, this.y, this.x, 0)
    an = Maths.angleBetween(this.x, this.y, this.x, 0)
    if (d < this.seight) {
      result = result.concat([zero, Maths.norm(-this.y, -this.seight, this.seight)]) // 52 - 53
    } else {
      result = result.concat([0, 0])
    }
    d = Maths.distance(this.x, this.y, this.x, CONSTANTS.HEIGHT)
    an = Maths.angleBetween(this.x, this.y, this.x, CONSTANTS.HEIGHT)
    if (d < this.seight) {
      result = result.concat([zero, Maths.norm(CONSTANTS.HEIGHT - this.y, -this.seight, this.seight)]) // 54 - 55
    } else {
      result = result.concat([0, 0])
    }
    if (result.length !== 56) console.log('RESULT !== 56', result.length)
    return result
  }

  move (x, y) {
    if (this.dead) return
    this.target = { x, y }
  }

  shoot (x, y) {
    if (this.dead) return
    const bullet = this.bullets.find(b => b.dead())
    if (bullet && this.btimer === 0) {
      const x = this.x + this.size * Math.cos(this.rotation)
      const y = this.y + this.size * Math.sin(this.rotation)
      bullet.shoot(x, y, this.rotation)
      this.btimer = CONSTANTS.BULLET_LIFE / 3
      this.score-=0.2
    }
    return false
  }

  setCollide (collide, life, noGod) {
    if (this.dead) return
    if (this.collide === 0) {
      if (this.god === 0) {
        this.life -= life * CONSTANTS.DIFFICULTY
        if (!noGod) this.god = 20
      }
    }
    this.collide = collide
  }

  update (planets, ships, asteroids, bonuses, bullets) {
    if (this.dead) return
    super.update()
    this.frames++
    this.angleFrames++
    if (this.god > 0) this.god--
    if (this.brain) {
      this.think(planets, ships, asteroids, bonuses, bullets)
      this.target = null
    }
    if (this.target) {
      this.vel = { x: 0, y: 0 }
      let xCenter = CONSTANTS.CANVAS_WIDTH / 2
      let yCenter = CONSTANTS.CANVAS_HEIGHT / 2
      if (this.x < CONSTANTS.CANVAS_WIDTH / 2) xCenter = this.x
      if (this.x > CONSTANTS.WIDTH - CONSTANTS.CANVAS_WIDTH / 2) xCenter = CONSTANTS.CANVAS_WIDTH - CONSTANTS.WIDTH + this.x
      if (this.y < CONSTANTS.CANVAS_HEIGHT / 2) yCenter = this.y
      if (this.y > CONSTANTS.HEIGHT - CONSTANTS.CANVAS_HEIGHT / 2) yCenter = CONSTANTS.CANVAS_HEIGHT - CONSTANTS.HEIGHT + this.y
      this.rotation = Maths.angleBetween(xCenter, yCenter, this.target.x, this.target.y)
      const distance = Maths.distance(xCenter, yCenter, this.target.x, this.target.y)
      if (distance > this.minMoveDistance) {
        const vX = Math.cos(this.rotation) * this.speed * Math.min(distance, this.maxAcceleration)
        const vY = Math.sin(this.rotation) * this.speed * Math.min(distance, this.maxAcceleration)
        this.vel.x += vX
        this.vel.y += vY
      } else {
        this.target = null
      }
    }

    // if (this.vel.x === 0 && this.vel.y === 0 && this.brain) this.score -= 0.2

    if (this.score < 0 && this.distance > 1000) this.life--

    for (let i = 0, l = planets.length, p; i < l; i++) {
      p = planets[i]
      if (p.owner === this.id) continue
      this.gravitateTo(p)
    }
    
    this.oldX = this.x * 1
    this.oldY = this.y * 1
    if (this.nbDist === 0) {
      this.xCheck = this.x * 1
      this.yCheck = this.y * 1
    }
    this.x += this.vel.x
    this.y += this.vel.y
    for (let i = 0, l = planets.length, x, y, r, p, d; i < l; i++) {
      p = planets[i]
      x = p.x
      y = p.y
      r = p.radius / 2
      if (this.circleCollide(x, y, r)) {
        if (p.owner === this.id) {
          this.setCollide(2, 1)
        } else {
          this.setCollide(20, 2)
        }
        break
      }
    }
    if (CONSTANTS.SHIP_SEE_SHIP) {
      for (let i = 0, l = ships.length, x, y, s, d; i < l; i++) {
        s = ships[i]
        if (s.id === this.id) continue
        x = s.x
        y = s.y
        if (this.shipCollide(x, y)) {
          this.setCollide(15, 2)
          break
        }
      }
    }
    if (this.worldCollide()) {
      this.setCollide(0, 1, true)
    }
    if (this.collide) {
      this.x -= this.vel.x * 2
      this.y -= this.vel.y * 2
      this.rotation += 0.5 * this.collide
      this.rotation = this.rotation % (Math.PI * 2)
      this.collide--
    }

    if (this.life < 0) {
      this.life = 0
      this.dead = true
    }

    if (!this.brain && (!this.best || this.best < this.score)) {
      this.best = this.score
      this.bestFrames = this.frames
    } else if (!this.best || this.best < this.distance) {
      this.best = this.distance
      this.bestFrames = this.frames
    }

    if (this.frames - this.bestFrames > 100) {
      this.life = 0
      this.dead = true
    }
    
    for (let i = 0, l = this.bullets.length, b; i < l; i++) {
      this.bullets[i].update(planets, ships)
    }
    if (this.btimer > 0) this.btimer--
    if (this.x > this.xMax) this.x = this.xMax
    if (this.x < this.xMin) this.x = this.xMin
    if (this.y > this.yMax) this.y = this.yMax
    if (this.y < this.yMin) this.y = this.yMin
    this.nbDist++
    if (!this.dead && this.life > 0) {
      const dist = Maths.distance(this.x, this.y, this.oldX, this.oldY)
      this.distance += dist / 100
      if (this.nbDist === 100) {
        const distCheck = Maths.distance(this.x, this.y, this.xCheck, this.yCheck)
        if (distCheck < 100) {
          // console.log('Mort pour innaction', distCheck)
          this.wrongCheck++
          if (this.wrongCheck > 3) {
            this.life = 0
            this.dead = true
          }
        } else {
          this.wrongCheck = 0
          // console.log('Distance OK', distCheck, this.x, this.y, this.xCheck, this.yCheck)
        }
      }
    }
    if (this.nbDist >= 100) this.nbDist = 0
  }

  circleCollide (x, y, r) {
    const x1 = this.x-this.size/2,
          y1 = this.y,
          x2 = this.x + this.size/2,
          y2 = this.y,
          x3 = this.x,
          y3 = this.y + this.size

    return Maths.circlePointCollision(x1, y1, x, y, r) ||
            Maths.circlePointCollision(x2, y2, x, y, r) ||
            Maths.circlePointCollision(x3, y3, x, y, r)
  }

  worldCollide () {
    const x1 = this.x-this.size/2,
          y1 = this.y,
          x2 = this.x + this.size/2,
          y2 = this.y,
          x3 = this.x,
          y3 = this.y + this.size
    if (x1 < this.xMin) return true
    if (x1 > this.xMax) return true
    if (y1 < this.yMin) return true
    if (y1 > this.yMax) return true
    if (x2 < this.xMin) return true
    if (x2 > this.xMax) return true
    if (y2 < this.yMin) return true
    if (y2 > this.yMax) return true
    if (x3 < this.xMin) return true
    if (x3 > this.xMax) return true
    if (y3 < this.yMin) return true
    if (y3 > this.yMax) return true
  }

  shipCollide (x, y) {
    const x1 = this.x-this.size/2,
          y1 = this.y,
          x2 = this.x + this.size/2,
          y2 = this.y,
          x3 = this.x,
          y3 = this.y + this.size,
          px1 = x-this.size/2,
          py1 = y,
          px2 = x + this.size/2,
          py2 = y,
          px3 = x,
          py3 = y + this.size
    return Maths.collideTriangleTriangle (px1, py1, px2, py2, px3, py3, x1, y1, x2, y2, x3, y3)
  }
}
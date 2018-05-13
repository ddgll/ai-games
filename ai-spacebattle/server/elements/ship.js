'use strict';
const ACTIONS_STRING = [
  'up',
  'upright',
  'upleft',
  'right',
  'left',
  'down',
  'downright',
  'downleft'
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

  nomType (type) {
    switch(type) {
      case 's': // .8
        return .8
      case 'w': // .7
        return .7
      case 'b': // .2
        return .2
      case 'p': // .4
        return .4
      case 'a': // .6
        return .6
      case 'bo': // .1
        return 0
      default:
        return 0
    }
  }

  think (planets, ships, asteroids, bonuses, bullets) {
    // return
    const obs = this.sense(planets, ships, asteroids, bonuses, bullets)
    // console.log(JSON.stringify(obs, null, 2))
    obs.sort((a, b) => a.d - b.d)
    this.obs = obs
    let inputs = [], max = 0, nbObs = 0
    const maxV = 20
    const dMaxV = 40
    const seight = this.seight * 2
    for(let i = 0, ips, mult, o; i < this.nbSensors; i++) {
      if (typeof obs[i] === 'undefined') {
        // ips = [ 0, 0, 0, 0, mult, 0, 0, mult ]
        ips = [ 0, 0, 0, 0, 0, 0, 1 ]
      } else {
        o = obs[i]
        ips = [
          this.nomType(o.type), // 7
          Maths.norm(o.x, -seight, seight), // 8
          Maths.norm(o.y, -seight, seight), // 9
          Maths.norm(o.vx, -CONSTANTS.BULLET_SPEED/2, CONSTANTS.BULLET_SPEED/2), // 10
          Maths.norm(o.vx, -CONSTANTS.BULLET_SPEED/2, CONSTANTS.BULLET_SPEED/2), // 11
          Maths.norm(o.r, 0, CONSTANTS.PLANET_MAX_RADIUS), // 12
          (o.o) // 13
        ]
      }
      inputs = inputs.concat(ips)
    }
    // for (let i = 0, l = inputs.length; i < l; i++) {
    //   inputs[i] /= this.maxInputsValues;
    // }
    inputs = [
      Maths.norm(this.rotation, -Math.PI * 2, Math.PI * 2), // 0
      Maths.norm(Maths.magnitude(this.vel.x, this.vel.y), 0, CONSTANTS.SHIP_SPEED * 2), // 1
      this.collide > 0 ? 1 : 0, // 2
      Maths.norm(nbObs, 0, this.nbSensors) // 3
    ].concat(inputs)
    // clear()
    // console.log(JSON.stringify(inputs, null, 2), inputs.length)
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
    // if (outputs[0] > .5) this.shoot()
    const label = this.oneHotDecode(outputs)
    this.action(label)
    // console.log(JSON.stringify(inputs, null, 2), inputs.length)
    // if (outputs[0] > 1 || outputs[1] > 1 || outputs[2] > 1 ||
    //   outputs[0] < 0 || outputs[1] < 0 || outputs[2] < 0 ) {
    //   // console.log('-------------------------------------------------------------')
    //   // console.log(JSON.stringify(inputs, null, 2), inputs.length)
    //   // console.log(JSON.stringify(outputs))
    //   // console.log(JSON.stringify(target))
    //   this.score = -100
    //   this.life = 0
    //   this.dead = true
    //   return null
    // }
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
    this.rotation += angle
    if (this.rotation > 2 * Math.PI) this.life--
    this.rotation = this.rotation % (2 * Math.PI)
  }

  sense (planets, ships, asteroids, bonuses, bullets) {
    const obs = []
    let d, x, y, r, an, ow
    planets.forEach(p => {
      x = p.x - this.x
      y = p.y - this.y
      r = p.radius
      d = Maths.distance(0, 0, x, y)
      an = Maths.angleBetween(0, 0, x, y)
      ow = p.owner === this.id ? 1 : p.challenger === this.id ? p.challenge / 100 : 0
      if (d < this.seight *2) obs.push({ type: 'p', x, y, r, d, vx: 0, vy: 0, o: ow, a: an })
    })
    if (CONSTANTS.SHIP_SEE_SHIP) {
      ships.forEach(s => {
        if (s.id === this.id) return
        x = s.x - this.x
        y = s.y - this.y
        d = Maths.distance(0, 0, x, y)
        an = Maths.angleBetween(0, 0, x, y)
        if (d < this.seight) obs.push({ type: 's', x, y, r: s.rotation, d, vx: s.collide ? 2 : s.vel.x, vy: s.collide ? 2 : s.vel.y, o: 0, a: an })
      })
    }
    asteroids.forEach(a => {
      x = a.x - this.x
      y = a.y - this.y
      d = Maths.distance(0, 0, x, y)
      an = Maths.angleBetween(0, 0, x, y)
      if (d < this.seight) obs.push({ type: 'a', x, y, r: a.radius, d, vx: a.vel.x, vy: a.vel.y, o: 0, a: an })
    })
    bonuses.forEach(b => {
      x = b.x - this.x
      y = b.y - this.y
      d = Maths.distance(0, 0, x, y)
      an = Maths.angleBetween(0, 0, x, y)
      if (d < this.seight) obs.push({ type: 'bo', x, y, r: CONSTANTS.BONUSES_RADIUS, d, vx: 0, vy: 0, o: 0, a: an })
    })
    bullets.forEach(b => {
      if (b.o === 's' + this.id) return
      if (b.o && b.o[0] === 's' && !CONSTANTS.SHIP_SEE_SHIP) return
      x = b.x - this.x
      y = b.y - this.y
      d = Maths.distance(0, 0, x, y)
      an = Maths.angleBetween(0, 0, x, y)
      if (d < this.seight) obs.push({ type: 'b', x, y, r: CONSTANTS.BULLET_RADIUS, d, vx: b.vx, vy: b.vy, o: b.owner === this.id ? 1 : 0, a: an })
    })
    d = Maths.distance(this.x, this.y, 0, this.y)
    an = Maths.angleBetween(this.x, this.y, 0, this.y)
    if (d < this.seight) obs.push({ type: 'w', x: -this.x, y: 0, r: 0, d: d, vx: 0, vy: 0, o: 0, a: an })
    d = Maths.distance(this.x, this.y, CONSTANTS.WIDTH, this.y)
    an = Maths.angleBetween(this.x, this.y, CONSTANTS.WIDTH, this.y)
    if (d < this.seight) obs.push({ type: 'w', x: CONSTANTS.WIDTH - this.x, y: 0, r: 0, d: d, vx: 0, vy: 0, o: 0, a: an })
    d = Maths.distance(this.x, this.y, this.x, 0)
    an = Maths.angleBetween(this.x, this.y, this.x, 0)
    if (d < this.seight) obs.push({ type: 'w', x: 0, y: -this.y, r: 0, d: d, vx: 0, vy: 0, o: 0, a: an })
    d = Maths.distance(this.x, this.y, this.x, CONSTANTS.HEIGHT)
    an = Maths.angleBetween(this.x, this.y, this.x, CONSTANTS.HEIGHT)
    if (d < this.seight) obs.push({ type: 'w', x: 0, y: CONSTANTS.HEIGHT - this.y, r: 0, d: d, vx: 0, vy: 0, o: 0, a: an })
    return obs
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
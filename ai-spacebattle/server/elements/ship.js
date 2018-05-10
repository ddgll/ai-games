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

    this.brain = brain
    this.seight = CONSTANTS.PLANET_MAX_RADIUS
    this.nbSensors = 5

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

  calculateFitness () {
    return this.score // + this.frames
  }

  nomType (type) {
    switch(type) {
      case 's': // .2
        return .2
      case 'b': // .4
        return .4
      case 'p': // .6
        return .6
      case 'a': // .8
        return .8
      case 'bo': // 1
        return .1
      default:
        return 0
    }
  }

  think (planets, ships, asteroids, bonuses, bullets) {
    const obs = this.sense(planets, ships, asteroids, bonuses, bullets)
    // console.log(JSON.stringify(obs, null, 2))
    obs.sort((a, b) => a.d - b.d)
    let inputs = []
    const maxV = 5
    const dMaxV = 10
    for(let i = 0, ips, o; i < this.nbSensors; i++) {
      if (typeof obs[i] === 'undefined') {
        ips = [ 0, 0, 0, 0, 1, 0, 0, 1 ]
      } else {
        o = obs[i]
        ips = [
          this.nomType(o.type), // 5
          o.x < 0 ? 0 : o.x / (CONSTANTS.WIDTH + 50), // 6
          o.y < 0 ? 0 : o.y / (CONSTANTS.HEIGHT + 50), // 7
          o.r, // 8
          o.d / this.seight, // 9
          (o.vx + maxV) / dMaxV, // 10
          (o.vy + maxV) / dMaxV, // 11
          o.o // 12
        ]
        switch (o.type) {
          case 's': // .2
            ips[3] = ips[3] / (Math.PI * 2)
            break
          case 'b': // .4
            ips[3] = 0.01
            break
          case 'p': // .6
            ips[3] = ips[3] / (CONSTANTS.PLANET_MAX_RADIUS + 10)
            break
          case 'a': // .8
          ips[3] = ips[3] / (CONSTANTS.ASTEROID_RADIUS + 2)
          break
          case 'bo': // 1
            ips[3] = 0.01
          default:
            return 0
        }
        
      }
      inputs = inputs.concat(ips)
    }
    inputs = [
      this.rotation / (Math.PI * 3),
      this.x / CONSTANTS.WIDTH, // 0
      this.y / CONSTANTS.HEIGHT, // 1
      this.collide ? 1 : (this.vel.x + maxV) / dMaxV, // 2
      this.collide ? 1 : (this.vel.y + maxV) / dMaxV, // 3
      this.collide > 0 ? 1 : 0
    ].concat(inputs)
    let th = true
    inputs.forEach((i, idx) => {
      if (i < 0 || i > 1) {
        // console.log('Input index', idx, 'not normaliszed', i)
        th = false
      }
    })
    if (!th) return
    const outputs = this.brain.activate(inputs)
    if (outputs[0] > .5) this.shoot()
    this.vel.x = (outputs[1] - 0.5) * 4
    this.vel.y = (outputs[2] - 0.5) * 4
    this.rotation = Maths.angleBetween(0, 0, this.vel.x, this.vel.y)
    // console.log(JSON.stringify(inputs, null, 2))
    // if (outputs[1] !== 1 || outputs[0] !== 1 || outputs[2] !== 1) {
    //   console.log('-------------------------------------------------------------')
    //   console.log(JSON.stringify(outputs))
    //   console.log(JSON.stringify([this.vel.x, this.vel.y, this.rotation]))
    // } else {
    //   // console.log(JSON.stringify(inputs, null, 2))
    // } 
  }

  sense (planets, ships, asteroids, bonuses, bullets) {
    const obs = []
    let d, x, y, r
    planets.forEach(p => {
      x = p.x
      y = p.y
      r = p.radius
      d = Maths.distance(this.x, this.y, x, y)
      if (d < this.seight) obs.push({ type: 'p', x, y, r, d, vx: 0, vy: 0, o: p.owner === this.id ? 1 : 0 })
    })
    ships.forEach(s => {
      if (s.id === this.id) return
      x = s.x
      y = s.y
      d = Maths.distance(this.x, this.y, x, y)
      if (d < this.seight) obs.push({ type: 's', x, y, r: s.rotation, d, vx: s.collide ? 2 : s.vel.x, vy: s.collide ? 2 : s.vel.y, o: 0 })
    })
    asteroids.forEach(a => {
      x = a.x
      y = a.y
      d = Maths.distance(this.x, this.y, x, y)
      if (d < this.seight) obs.push({ type: 'a', x, y, r: a.radius, d, vx: a.vel.x, vy: a.vel.y, o: 0 })
    })
    bonuses.forEach(b => {
      x = b.x
      y = b.y
      d = Maths.distance(this.x, this.y, x, y)
      if (d < this.seight) obs.push({ type: 'bo', x, y, r: CONSTANTS.BONUSES_RADIUS, d, vx: 0, vy: 0, o: 0 })
    })
    bullets.forEach(b => {
      if (b.owner === 's' + this.id) return
      x = b.x
      y = b.y
      d = Maths.distance(this.x, this.y, x, y)
      if (d < this.seight) obs.push({ type: 'b', x, y, r: CONSTANTS.BULLET_RADIUS, d, vx: b.vel.x, vy: b.vel.y, o: b.owner === this.id ? 1 : 0 })
    })
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
    if (this.target !== null) {
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
    } else if (this.brain) this.think(planets, ships, asteroids, bonuses, bullets)

    if (this.vel.x === 0 && this.vel.y === 0) this.score--

    for (let i = 0, l = planets.length, p; i < l; i++) {
      p = planets[i]
      if (p.owner === this.id) continue
      this.gravitateTo(p)
    }
    if (this.vel.x > CONSTANTS.SHIP_SPEED) this.vel.x = CONSTANTS.SHIP_SPEED
    if (this.vel.y > CONSTANTS.SHIP_SPEED) this.vel.y = CONSTANTS.SHIP_SPEED
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
    
    for (let i = 0, l = this.bullets.length, b; i < l; i++) {
      this.bullets[i].update(planets, ships)
    }
    if (this.btimer > 0) this.btimer--
    if (this.x > this.xMax) this.x = this.xMax
    if (this.x < this.xMin) this.x = this.xMin
    if (this.y > this.yMax) this.y = this.yMax
    if (this.y < this.yMin) this.y = this.yMin
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
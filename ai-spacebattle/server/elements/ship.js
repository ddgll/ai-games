'use strict';
const ACTIONS_STRING = [
  'up',
  'right',
  'left',
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
    this.lastScore = 0

    this.brain = brain
    this.seight = CONSTANTS.PLANET_MAX_RADIUS
    this.nbSensors = 5
    this.angleFrames = 0
    this.oldAngle = null
    this.check360 = 0

    this.label = null
    this.outputs = null

    this.distance = 0

    this.oldX = null
    this.oldY = null

    this.name = name
    this.life = CONSTANTS.MAX_LIFE
    this.lastLife = CONSTANTS.MAX_LIFE
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

  isNear (item, planets) {
    for(let i = 0, l = planets.length, p, d, d1, d2, d3, d4, d5; i < l; i++){
      p = planets[i];
      d = Maths.distance(item.x, item.y, p.x, p.y);
      d1 = Maths.distance(item.x, item.y, item.x, CONSTANTS.HEIGHT);
      d2 = Maths.distance(item.x, item.y, item.x, 0);
      d3 = Maths.distance(item.x, item.y, 0, item.y);
      d4 = Maths.distance(item.x, item.y, CONSTANTS.WIDTH, item.y);
      if( d < CONSTANTS.PLANET_MIN_RADIUS || 
          d1 < CONSTANTS.PLANET_MIN_RADIUS ||
          d2 < CONSTANTS.PLANET_MIN_RADIUS ||
          d3 < CONSTANTS.PLANET_MIN_RADIUS ||
          d4 < CONSTANTS.PLANET_MIN_RADIUS
        ) return true
    }
    return false
  }

  reset (planets) {
    // let x, y
    // do{
    //   x = Maths.randomInt(0+CONSTANTS.PLANET_MAX_RADIUS, CONSTANTS.WIDTH-CONSTANTS.PLANET_MAX_RADIUS)
    //   y = Maths.randomInt(0+CONSTANTS.PLANET_MAX_RADIUS, CONSTANTS.HEIGHT-CONSTANTS.PLANET_MAX_RADIUS)
    // } while(this.isNear({ x, y }, planets))
    // this.x = x
    // this.y = y
    this.oldX = null
    this.oldY = null
    this.life = CONSTANTS.MAX_LIFE
    for (let i = 0, b; i < CONSTANTS.BULLET_COUNT; i++) {
      b = this.bullets[i]
      b.life = 0
    }
    this.btimer = 0
    this.collide = 0
    this.score = 0
    this.lastScore = 0
    this.lastLife = CONSTANTS.MAX_LIFE
    this.distance = 0
    this.frames = 0
    this.god = 0
    this.oldAngle = null
    this.angleFrames = 0
    this.check360 = 0
    this.target = null
    this.outputs = null
    this.label = null
    this.dead = false
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
    // if (this.frames % 4 === 0) {
      let lifeReward = this.dead ? 0 : (this.lastLife === this.life) ? 1 : 1 - Maths.norm(this.lastLife - this.life, 0, 10)
      if (lifeReward < 0) lifeReward = 0
      const scoreReward = (this.dead || this.collide || this.score < 1 || this.lastScore > this.score) ? 0 : 1 - (1 / this.score)
      const velReward = (this.dead || this.collide || Maths.magnitude(this.vel.x, this.vel.y) < CONSTANTS.SHIP_SPEED / 2 ) ? 0 : Maths.norm(Maths.magnitude(this.vel.x, this.vel.y), CONSTANTS.SHIP_SPEED / 2, CONSTANTS.SHIP_SPEED)
      this.reward = Maths.norm(Maths.norm(lifeReward + scoreReward, 0, 2) + velReward, 0, 2)
      // this.reward = this.distance / this.frames // Maths.norm(Maths.magnitude(this.vel.x, this.vel.y), 0, CONSTANTS.SHIP_SPEED)
      this.lastLife = this.life * 1
      // console.log('REWARDS', lifeReward, scoreReward, velReward, Maths.magnitude(this.vel.x, this.vel.y))
      if (this.reward > 1 || this.reward < 0) {
        console.error('0 > REWARD > 1 !! ARF :(', this.reward, lifeReward, scoreReward, velReward)
      }
      this.lastScore = this.score * 1.00
      if (this.dead) this.reset(planets)
      this.obs = this.sense(planets, ships, asteroids, bonuses, bullets)
      const vel = Math.sqrt(2) * (CONSTANTS.SHIP_SPEED*2)
      const inputs = [
        Maths.norm(this.rotation, -Math.PI * 2, Math.PI * 2), // 0
        Maths.norm(this.vel.x, -vel, vel), // 1
        Maths.norm(this.vel.y, -vel, vel), // 2
        Maths.norm(this.gra.x, -vel, vel), // 3
        Maths.norm(this.gra.y, -vel, vel), // 4
        this.collide > 0 ? 1.00 : .00 // 56
      ].concat(this.obs)
      this.loss = this.brain.learn(this.reward)
      this.outputs = this.brain.policy(inputs)
      this.outputs = this.outputs.map(o => {
        const oo = (o + 1) / 2
        if (oo < 0 || oo > 1) console.error('OUTPUT !!!', oo)
        return oo
      })
      // console.log('inputs', inputs)
      this.label = this.oneHotDecode(this.outputs)
      // console.log(this.outputs, this.label)
    // }
    if (this.label) this.action(this.label)
    return null
  }

  action (label) {
    // console.log('ACTION', label)
    this.vel.x *= CONSTANTS.AIR_RESISTENCE
    this.vel.y *= CONSTANTS.AIR_RESISTENCE
    switch (label) {
      case 'up':
        this.boost()
        this.turn(0)
        break;
      case 'left':
        this.turn(-CONSTANTS.TURN_ANGLE)
        break;
      case 'right':
        this.turn(CONSTANTS.TURN_ANGLE)
        break;
      case 'fire':
        this.shoot()
        break;
    }

    if (Maths.magnitude(this.vel.x, this.vel.y) > (CONSTANTS.SHIP_SPEED)) {
      this.vel = Maths.magnitude(this.vel.x, this.vel.y, CONSTANTS.SHIP_SPEED)
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
    let d, x, y, r, an, ow, sei, min = Infinity
    planets.forEach(p => {
      x = p.x - this.x
      y = p.y - this.y
      r = p.radius
      d = Maths.distance(0, 0, x, y)
      ow = p.owner === this.id ? 1 : p.challenger === this.id ? p.challenge / 100 : 0
      sei = this.seight * 4
      if (d < sei) obs.planets.push({
        d: d,
        data: [
        Maths.norm(x, -sei, sei), // 0 - 4
        Maths.norm(y, -sei, sei), // 1 - 5
        Maths.norm(r, CONSTANTS.PLANET_MIN_RADIUS, CONSTANTS.PLANET_MAX_RADIUS), // 2 - 6
        ow === this.id ? 1 : 0 // 3 - 7
      ]})
    })
    obs.planets.sort(sort)
    while (obs.planets.length < 2) obs.planets.push({ d: 0, data: [ 1, 1, 0, 0 ] })
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
    while (obs.ships.length < 2) obs.ships.push({ d: 0, data: [ 1, 1, 0, 0, 0, 0 ] })
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
    while (obs.asteroids.length < 2) obs.asteroids.push({ d: 0, data: [ 1, 1, 0, 0 ] })
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
    while (obs.bonuses.length < 2) obs.bonuses.push({ d: 0, data: [ 1, 1 ] })
    result = result.concat(obs.bonuses.slice(0, 2).map(d => d.data).reduce(reduce)) // 4
    const reg = /^s[0-9]+$/
    const regrep = /[^0-9]/g
    bullets.forEach(b => {
      if (reg.test(b.o) && b.o.replace(regrep, '') === this.id.replace(regrep, '')) return
      x = b.x - this.x
      y = b.y - this.y
      d = Maths.distance(0, 0, x, y)
      an = Maths.angleBetween(0, 0, x, y)
      if (d < this.seight) obs.bullets.push({
        d: d,
        data: [
        Maths.norm(x, -this.seight, this.seight), // 32 - 36 - 40 - 44
        Maths.norm(y, -this.seight, this.seight), // 33 - 37 - 41 - 45
        Maths.norm(b.vx, -velb, velb), // 34 - 38 - 42 - 46
        Maths.norm(b.vy, -velb, velb), // 35 - 39 - 43 - 47
      ]})
    })
    obs.bullets.sort(sort)
    while (obs.bullets.length < 4) obs.bullets.push({ d: 0, data: [ 1, 1, 0, 0 ] })
    const zero = Maths.norm(0, -this.seight, this.seight)
    result = result.concat(obs.bullets.slice(0, 4).map(d => d.data).reduce(reduce)) // 8
    d = Maths.distance(this.x, this.y, 0, this.y)
    an = Maths.angleBetween(this.x, this.y, 0, this.y)
    if (d < this.seight) {
      result = result.concat([Maths.norm(-this.x, -this.seight, this.seight), zero]) // 48 - 49
    } else {
      result = result.concat([1, 1])
    }
    d = Maths.distance(this.x, this.y, CONSTANTS.WIDTH, this.y)
    an = Maths.angleBetween(this.x, this.y, CONSTANTS.WIDTH, this.y)
    if (d < this.seight) {
      result = result.concat([Maths.norm(CONSTANTS.WIDTH - this.x, -this.seight, this.seight), zero]) // 50 - 51
    } else {
      result = result.concat([1, 1])
    }
    d = Maths.distance(this.x, this.y, this.x, 0)
    an = Maths.angleBetween(this.x, this.y, this.x, 0)
    if (d < this.seight) {
      result = result.concat([zero, Maths.norm(-this.y, -this.seight, this.seight)]) // 52 - 53
    } else {
      result = result.concat([1, 1])
    }
    d = Maths.distance(this.x, this.y, this.x, CONSTANTS.HEIGHT)
    an = Maths.angleBetween(this.x, this.y, this.x, CONSTANTS.HEIGHT)
    if (d < this.seight) {
      result = result.concat([zero, Maths.norm(CONSTANTS.HEIGHT - this.y, -this.seight, this.seight)]) // 54 - 55
    } else {
      result = result.concat([1, 1])
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
      if (this.brain) this.score -= 0.2
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
    if (this.brain) this.score -= collide
    this.collide = collide
  }

  update (planets, ships, asteroids, bonuses, bullets) {
    if (this.dead && !this.brain) return
    super.update()
    this.frames++
    this.angleFrames++
    if (this.god > 0) this.god--
    if (this.brain) {
      this.target = this.think(planets, ships, asteroids, bonuses, bullets)
    }
    if (this.target) {
      this.vel = { x: 0, y: 0 }
      let distance
      if (!this.brain) {
        let xCenter = CONSTANTS.CANVAS_WIDTH / 2
        let yCenter = CONSTANTS.CANVAS_HEIGHT / 2
        if (this.x < CONSTANTS.CANVAS_WIDTH / 2) xCenter = this.x
        if (this.x > CONSTANTS.WIDTH - CONSTANTS.CANVAS_WIDTH / 2) xCenter = CONSTANTS.CANVAS_WIDTH - CONSTANTS.WIDTH + this.x
        if (this.y < CONSTANTS.CANVAS_HEIGHT / 2) yCenter = this.y
        if (this.y > CONSTANTS.HEIGHT - CONSTANTS.CANVAS_HEIGHT / 2) yCenter = CONSTANTS.CANVAS_HEIGHT - CONSTANTS.HEIGHT + this.y
        this.rotation = Maths.angleBetween(xCenter, yCenter, this.target.x, this.target.y)
        distance = Maths.distance(xCenter, yCenter, this.target.x, this.target.y)
      } else {
        this.rotation = Maths.angleBetween(0, 0, this.target.x, this.target.y)
        distance = Maths.distance(0, 0, this.target.x, this.target.y)
      }
      if (distance > this.minMoveDistance) {
        const vX = Math.cos(this.rotation) * this.speed * Math.min(distance, this.maxAcceleration)
        const vY = Math.sin(this.rotation) * this.speed * Math.min(distance, this.maxAcceleration)
        this.vel.x += vX
        this.vel.y += vY
      } else {
        this.target = null
      }
    }

    if (Maths.magnitude(this.vel.x, this.vel.y) < 1e-8 && this.brain) this.score--

    if (this.score < 0) this.life--

    for (let i = 0, l = planets.length, p; i < l; i++) {
      p = planets[i]
      if (p.owner === this.id) continue
      this.gravitateTo(p)
    }

    if (Maths.magnitude(this.gra.x, this.gra.y) > (CONSTANTS.SHIP_SPEED * 2)) {
      this.gra = Maths.magnitude(this.gra.x, this.gra.y, CONSTANTS.SHIP_SPEED * 2)
    }
    
    this.oldX = this.x * 1.00
    this.oldY = this.y * 1.00
    this.x += this.vel.x + this.gra.x
    this.y += this.vel.y + this.gra.y
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
      if (this.brain) {
        this.setCollide(0, 20, true)
      } else {
        this.setCollide(0, 1, true)
      }
    }
    if (this.collide) {
      this.x -= this.vel.x * 2
      this.y -= this.vel.y * 2
      this.rotation += 0.5 * this.collide
      this.rotation = this.rotation % (Math.PI * 2)
      this.collide--
      if (this.collide === 0) {
        this.vel.x = 0
        this.vel.y = 0
      }
    }
    
    for (let i = 0, l = this.bullets.length, b; i < l; i++) {
      this.bullets[i].update(planets, ships, asteroids)
    }
    if (this.btimer > 0) this.btimer--
    if (this.x > this.xMax) this.x = this.xMax
    if (this.x < this.xMin) this.x = this.xMin
    if (this.y > this.yMax) this.y = this.yMax
    if (this.y < this.yMin) this.y = this.yMin
    if (!this.dead && this.life > 0) {
      const dist = Maths.distance(this.x, this.y, this.oldX, this.oldY)
      this.distance += dist / 100
    }

    if (this.life <= 0 || this.dead) {
      this.life = 0
      this.dead = true
      // console.log('DIE', this.brain.forTraining, 'DEAD', this.dead, this.life)
    }
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
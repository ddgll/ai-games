'use strict';
const ACTIONS_STRING = [
  'up',
  'right',
  'left',
  'fire',
  'nothing'
]
const clear = require('clear')
const Element = require('./element')
const Maths = require('../maths')
const Bullet = require('./bullet')
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

    this.isBooting = false
    this.turning = 0

    this.beforeAngle = 0

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
    // if (this.brain && this.brain.training) this.brain.reset()
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
    this.turning += angle
  }

  move (x, y, o) {
    if (this.dead) return
    this.target = { x, y }
  }

  moveKeyboard (boosting, angle) {
    if (this.dead) return
    this.isBooting = boosting
    this.turn(angle)
  }

  shoot (x, y) {
    if (this.dead) return
    const bullet = this.bullets.find(b => b.dead())
    if (bullet && this.btimer === 0) {
      const x = this.x + this.size * Math.cos(this.rotation)
      const y = this.y + this.size * Math.sin(this.rotation)
      bullet.shoot(x, y, this.rotation)
      this.btimer = CONSTANTS.BULLET_LIFE / 3
      if (CONSTANTS.TRAINING) this.life -= 0.2
    }
    return false
  }

  invert(x, y) {
    const cos = Math.cos(Math.PI),
        sin = Math.sin(Math.PI),
        nx = (cos * (x)) + (sin * (y)),
        ny = (cos * (y)) - (sin * (x));
    return { x: nx, y: ny };
  }

  setCollide (x, y, collide, life, noGod, wall = false) {
    if (this.dead) return
    if (this.collide === 0) {
      if (this.collide > 5) {
        this.beforeAngle = this.rotation * 1.00
      } else {
        this.beforeAngle = -this.rotation * 1.00
      }
      if (this.god === 0) {
        this.life -= life * CONSTANTS.DIFFICULTY
        if (!noGod) this.god = 50
      }
      this.gra.x = 0
      this.gra.y = 0
      this.vel.x = 0
      this.vel.y = 0
      let dx = x - this.x,
          dy = y - this.y
      if (wall) {
        dx = x - CONSTANTS.WIDTH / 2
        dy = y - CONSTANTS.HEIGHT / 2
      }
			let distSQ = dx * dx + dy * dy,
          dist = Math.sqrt(distSQ),
          ax = (dx) / dist * 6,
          ay = (dy) / dist * 6
      // if (Maths.magnitude(ax, ay) < CONSTANTS.SHIP_SPEED) {
      //   let v = Maths.magnitude(ax, ay, CONSTANTS.SHIP_SPEED)
      //   ax = v.x
      //   ay = v.y
      // }
      this.vel.x -= ax;
      this.vel.y -= ay;
    }
    this.collide = collide
  }

  update (planets, ships, asteroids, bonuses, bullets) {
    if (this.dead && !CONSTANTS.TRAINING) return
    if (this.dead) {
      this.reset()
    }
    super.update()
    this.frames++
    this.angleFrames++
    if (this.god > 0) this.god--
    if (!this.collide) {
      if (this.target) {
        this.vel = { x: 0, y: 0 }
        let distance
        let xCenter = CONSTANTS.CANVAS_WIDTH / 2
        let yCenter = CONSTANTS.CANVAS_HEIGHT / 2
        if (this.x < CONSTANTS.CANVAS_WIDTH / 2) xCenter = this.x
        if (this.x > CONSTANTS.WIDTH - CONSTANTS.CANVAS_WIDTH / 2) xCenter = CONSTANTS.CANVAS_WIDTH - CONSTANTS.WIDTH + this.x
        if (this.y < CONSTANTS.CANVAS_HEIGHT / 2) yCenter = this.y
        if (this.y > CONSTANTS.HEIGHT - CONSTANTS.CANVAS_HEIGHT / 2) yCenter = CONSTANTS.CANVAS_HEIGHT - CONSTANTS.HEIGHT + this.y
        this.rotation = Maths.angleBetween(xCenter, yCenter, this.target.x, this.target.y)
        distance = Maths.distance(xCenter, yCenter, this.target.x, this.target.y)
        if (distance > this.minMoveDistance) {
          const vX = Math.cos(this.rotation) * this.speed * Math.min(distance, this.maxAcceleration)
          const vY = Math.sin(this.rotation) * this.speed * Math.min(distance, this.maxAcceleration)
          this.vel.x += vX
          this.vel.y += vY
        } else {
          this.target = null
        }
      } else {
        this.vel.x *= CONSTANTS.AIR_RESISTENCE
        this.vel.y *= CONSTANTS.AIR_RESISTENCE
        if (this.isBooting) this.boost()
        this.rotation += this.turning
        this.rotation = this.rotation % (2 * Math.PI)
        this.turning = 0
      }
    }

    if (CONSTANTS.TRAINING && Maths.magnitude(this.vel.x, this.vel.y) < 1e-2) {
      this.life--
    }

    if (this.score < 0) this.life--
    
    this.oldX = this.x * 1.00
    this.oldY = this.y * 1.00
    for (let i = 0, l = planets.length, x, y, r, p, d; i < l; i++) {
      p = planets[i]
      x = p.x
      y = p.y
      r = p.radius / 2
      if (this.circleCollide(x, y, r)) {
        // this.gravitateTo({ x, y, mass: p.mass, repulsive: true })
        if (p.owner === this.id) {
          this.setCollide(x, y, 10, 10, false)
        } else {
          this.setCollide(x, y, 10, 20, false)
        }
        break
      } else if (!this.collide) {
        this.gravitateTo(p)
      }
    }
    if (Maths.magnitude(this.gra.x, this.gra.y) > (CONSTANTS.SHIP_SPEED * 2)) {
      this.gra = Maths.magnitude(this.gra.x, this.gra.y, CONSTANTS.SHIP_SPEED * 2)
    }
    for (let i = 0, l = ships.length, x, y, s, d; i < l; i++) {
      s = ships[i]
      if (s.id === this.id) continue
      x = s.x
      y = s.y
      if (this.shipCollide(x, y)) this.setCollide(x, y, 5, 5)
    }
    for (let i = 0, l = asteroids.length, x, y, a, d; i < l; i++) {
      a = asteroids[i]
      x = a.x
      y = a.y
      if (this.circleCollide(x, y, CONSTANTS.ASTEROID_RADIUS)) this.setCollide(x, y, 5, 20)
    }
    const collide = this.worldCollide()
    if (collide && CONSTANTS.TRAINING) {
      // this.setCollide(collide.x, collide.y, 10, 5, true, true)
      this.life -= 5
    }
    if (this.collide > 0) {
      if (this.collide > 5) {
        this.rotation += 0.5
        this.rotation = this.rotation % (Math.PI * 2)
      }
      this.collide--
      if (this.collide === 0) {
        this.vel.x = 0
        this.vel.y = 0
        this.rotation = this.beforeAngle + Math.PI
      }
    }
    this.x += this.vel.x + this.gra.x
    this.y += this.vel.y + this.gra.y
    
    for (let i = 0, l = this.bullets.length, b; i < l; i++) {
      this.bullets[i].update(planets, ships, asteroids)
    }
    if (this.btimer > 0) this.btimer--
    if (this.x > this.xMax + 5) this.x = this.xMax - 5
    if (this.x < this.xMin - 5) this.x = this.xMin + 5
    if (this.y > this.yMax + 5) this.y = this.yMax - 5
    if (this.y < this.yMin - 5) this.y = this.yMin + 5
    if (!this.dead && this.life > 0) {
      const dist = Maths.distance(this.x, this.y, this.oldX, this.oldY)
      this.distance += dist / 100
    }

    if (this.life <= 0 || this.dead) {
      this.life = 0
      this.dead = true
      if (CONSTANTS.TRAINING) {
        this.reset()
      }
    }
  }

  circleCollide (x, y, r) {
    const x1 = this.x-this.size/2,
          y1 = this.y-this.size/2,
          x2 = this.x + this.size/2,
          y2 = this.y-this.size/2,
          x3 = this.x,
          y3 = this.y + this.size/2

    return Maths.circlePointCollision(x1, y1, x, y, r + 5) ||
            Maths.circlePointCollision(x2, y2, x, y, r + 5) ||
            Maths.circlePointCollision(x3, y3, x, y, r + 5)
  }

  worldCollide () {
    const x1 = this.x-this.size/2,
          y1 = this.y-this.size/2,
          x2 = this.x + this.size/2,
          y2 = this.y-this.size/2,
          x3 = this.x,
          y3 = this.y + this.size / 2
    if (x1 < this.xMin) return { x: this.xMin, y: this.y }
    if (x1 > this.xMax) return { x: this.xMax, y: this.y }
    if (y1 < this.yMin) return { x: this.x, y: this.yMin }
    if (y1 > this.yMax) return { x: this.x, y: this.yMax }
    if (x2 < this.xMin) return { x: this.xMin, y: this.y }
    if (x2 > this.xMax) return { x: this.xMax, y: this.y }
    if (y2 < this.yMin) return { x: this.x, y: this.yMin }
    if (y2 > this.yMax) return { x: this.x, y: this.yMax }
    if (x3 < this.xMin) return { x: this.xMin, y: this.y }
    if (x3 > this.xMax) return { x: this.xMax, y: this.y }
    if (y3 < this.yMin) return { x: this.x, y: this.yMin }
    if (y3 > this.yMax) return { x: this.x, y: this.yMax }
    return null
  }

  shipCollide (x, y) {
    const x1 = this.x-this.size/2,
          y1 = this.y-this.size/2,
          x2 = this.x + this.size/2,
          y2 = this.y-this.size/2,
          x3 = this.x,
          y3 = this.y + this.size / 2,
          px1 = x-this.size/2,
          py1 = y,
          px2 = x + this.size/2,
          py2 = y,
          px3 = x,
          py3 = y + this.size
    return Maths.collideTriangleTriangle (px1, py1, px2, py2, px3, py3, x1, y1, x2, y2, x3, y3)
  }
}
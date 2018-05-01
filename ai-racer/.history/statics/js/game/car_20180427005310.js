import { Z_SYNC_FLUSH } from "zlib";

function Car (x, y, brain, isBest, isTest) {
  this.position = createVector(x, y)
  this.oldPosition
  this.r = 5
  this.heading = 0
  this.rotation = 0
  this.reverse = false

  this.seight = 100

  this.sensors = []
  this.obstacles = []

  this.velocity = createVector(0, 0)
  this.isBoosting = false
  this.isBreaking = false

  this.killed = false
  this.debug = false
  this.first = false

  this.best = isBest
  this.test = isTest

  this.score = 0
  this.frames = 0
  this.fitness = 0

  if (brain) {
    this.brain = brain
  } else {
    this.brain = new neataptic.architect.Random(13, 8, 1)
  }

  this.setSensors = function () {
    const x = this.position.x
    const y = this.position.y
    for (let i = 0; i < 7; i++) {
      let xs = x + this.seight * cos(i*QUARTER_PI)
      let ys = y + this.seight * sin(i*QUARTER_PI)
      this.sensors.push({ x: xs, y: ys })
    }
  }

  getAngle (x, y) {
    return Math.atan2(y - this.y, x - this.x)
  }

  this.draw = function () {
    if (this.killed) return
    console.log('DRAW CAR', this.isBoosting)
    if (this.best) {
      stroke(255, 0, 0)
      fill(255, 0, 0)
    } else if (this.test) {
      stroke(0, 255, 0)
      fill(0, 255, 0)
    } else {
      stroke(255)
      fill(255, 50)
    }
    if (this.reverse) storke(255, 0, 0)
    push()
    translate(this.position.x, this.position.y)
    rotate(this.heading + PI / 2)
    triangle(-this.r, this.r, this.r, this.r, 0, -this.r)
    pop()
    this.sensors.forEach(s => {
      stroke(0, 255, 0)
      line(this.x, this.y, s.x, s.y)
    })
    this.obstacles.forEach(o => {
      stroke(0, 255, 0)
      ellipse(o.x, o.y, , )
    })

  }

  this.crash = function () {
    this.velocity = 0
    this.heading = 0
    this.rotation = 0
    this.isBoosting = false
    this.isBreaking = false
    this.killed = true
  }

  this.setRotation = function (angle) {
    if (this.killed) return
    this.rotation = angle
  }

  this.boosting = function (boosting) {
    if (this.killed) return
    this.isBoosting = boosting
  }

  this.breaking = function (breaking) {
    if (this.killed) return
    this.isBreaking = breaking
  }

  this.boost = function () {
    if (this.killed) return
    const force = p5.Vector.fromAngle(this.heading)
    force.mult(BOOST_RESISTENCE)
    this.velocity.add(force)
  }

  this.break = function () {
    if (this.killed) return
    const force = p5.Vector.fromAngle(this.heading)
    force.mult(BREAK_RESISTENCE)
    this.velocity.sub(force)
  }

  this.sense = function (circuit) {
    const obstacles = []
    for (let i = 0, l = this.sensors.length, s, x, y; i < l; i++) {
      s = this.sensors[i]
      x = s.x
      y = s.y
      while (!circuit.checkPoint(x, y)) {
        if (s.x > this.x) {
          x--
          y = this.fx(this.x, this.y, s.x, s.y, x)
          if (x < this.x) break;
        } else if (s.x < this.x) {
          x++
          y = this.fx(this.x, this.y, s.x, s.y, x)
          if (x > this.x) break;
        } else if(s.y > this.y) {
          y--
          x = this.fy(this.x, this.y, s.x, s.y, y)
          if (y < this.y) break;
        } else if(s.y < this.y) {
          y++
          x = this.fy(this.x, this.y, s.x, s.y, y)
          if (y > this.y) break;
        }
      }
      obstacles.push({ x, y })
    }
    return obstacles
  }

  this.fx = function (x1, y1, x2, y2, x) {
    const a = (y2 - y1) / (x2 - x1)
    const b = y1 - a * x1
    return a * x + b
  }

  this.fy = function (x1, y1, x2, y2, y) {
    const a = (y2 - y1) / (x2 - x1)
    const b = y1 - a * x1
    return (y - b) / a
  }

  this.think = function (pipes) {
    if (this.killed) return
    this.obstacles = this.sense()
    const inputs = [
      this.velocity,
      this.y,
      p1 ? distance(this.x, this.y, p1.x, p1.top) / width : 0,
      p1 ? distance(this.x, this.y, p1.x, p1.bottom) / width : 0,
      p1 ? p1.width / width : 0,
      p2 ? distance(this.x, this.y, p2.x, p2.top) / width : 0,
      p2 ? distance(this.x, this.y, p2.x, p2.bottom) / width : 0,
      p2 ? p2.width / width : 0,
      p3 ? distance(this.x, this.y, p3.x, p3.top) / width : 0,
      p3 ? distance(this.x, this.y, p3.x, p3.bottom) / width : 0,
      p3 ? p3.width / width : 0,
      pipes.length / width
    ]
    // const output = this.brain.activate(inputs);
    // if (output[0] > 0.5) this.up()
  }

  this.turn = function () {
    if (this.killed) return
    this.heading += this.rotation
  }

  this.update = function () {
    if (this.killed) return
    this.score++
    this.frames++
    this.turn()
    if (this.isBoosting) {
      this.boost()
    }
    if (this.isBreaking) {
      this.break()
    }
    this.oldPosition = this.position
    this.position.add(this.velocity)
    this.velocity.mult(AIR_RESISTENCE)
    this.setSensors()
  }
}
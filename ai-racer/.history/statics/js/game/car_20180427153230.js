function Car (x, y, brain, isBest, isTest) {
  this.position = createVector(x, y)
  this.oldPosition
  this.r = 5
  this.heading = 0
  this.rotation = 0
  this.reverse = false

  this.seight = 50

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

  this.setSensors = function (x, y) {
    this.sensors = []
    this.obstacles = []
    for (let i = 0, xs, ys, a; i < 8; i++) {
      a = i * QUARTER_PI
      xs = x + this.seight * cos(a)
      ys = y + this.seight * sin(a)
      this.sensors.push({ angle: a, v: createVector(xs, ys) })
    }
  }
  this.setSensors(x, y)

  this.getAngle = function (x, y) {
    return Math.atan2(y - this.y, x - this.x)
  }

  this.draw = function () {
    if (this.killed) return
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
    for (let i = 0, l = this.sensors.length, s, sv, ov; i < l; i++) {
      s = this.sensors[i]
      stroke(0, 255, 0)
      sv = createVector(this.seight * cos(s.angle), this.seight * sin(s.angle))
      line(0, 0, sv.x, sv.y)
    }
    pop()
    for (let i = 0, l = this.obstacles.length, ov; i < l; i++) {
      ov = this.obstacles[i].v
      stroke(255, 0, 0)
      ellipse(ov.x, ov.y, 5, 5)
    }
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
    for (let i = 0, s, v, d, n, obs, a, x, y, pas; i < 8; i++) {
      a = (i * QUARTER_PI + this.heading)
      x = this.position.x + this.seight * cos(a)
      y = this.position.y + this.seight * sin(a)
      pas = this.seight / 1000
      obs = null
      v = createVector(x, y)
      while (pas < 1) {
        n = v
        n.mult(pas)
        d = b.dist(this.position)
        if (!circuit.checkPoint(b.x, b.y)) {
          obstacles.push({ v: b, d })
          pas = 1
        }
        pas+=pas
      }
    }
    return obstacles
  }

  this.fx = function (x1, y1, x2, y2, x) {
    if (x2 - x1 === 0) return y2
    const a = (y2 - y1) / (x2 - x1)
    const b = y1 - a * x1
    // console.log('y = ' + a + '*x + ' + b, y2, y1, x2, x1)
    return a * x + b
  }

  this.fy = function (x1, y1, x2, y2, y) {
    if (x2 - x1 === 0) return x1
    const a = (y2 - y1) / (x2 - x1)
    const b = y1 - a * x1
    // console.log('x = (y - ' + b + ') / ' + a, y2, y1, x2, x1)
    return (y - b) / a
  }

  this.think = function (circuit) {
    if (this.killed) return
    this.obstacles = this.sense(circuit)
    const inputs = [
      this.velocity.normalize(),
      this.position.normalize()
    ]
    this.sensors.forEach(s => {

    })
    // const output = this.brain.activate(inputs);
    // if (output[0] > 0.5) this.up()
  }

  this.turn = function () {
    if (this.killed) return
    this.heading += this.rotation
  }

  this.update = function (circuit) {
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
    this.sensors.forEach(s => s.v.add(this.velocity))
    this.velocity.mult(AIR_RESISTENCE)
    if (this.test && circuit) this.obstacles = this.sense(circuit)
  }
}

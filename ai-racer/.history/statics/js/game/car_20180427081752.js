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
    for (let i = 0, xs, ys, a; i < 7; i++) {
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
    for (let i = 0, l = this.sensors.length, s; i < l; i++) {
      s = this.sensors[i]
      stroke(0, 255, 0)
      let xs = 0 + this.seight * cos(s.angle)
      let ys = 0 + this.seight * sin(s.angle)
      line(0, 0, xs, ys)
    }
    pop()
    for (let i = 0, l = this.obstacles.length, o; i < l; i++) {
      o = this.obstacles[i]
      push()
      translate(o.x, o.y)
      stroke(0, 255, 0)
      ellipse(0, 0, 5, 5)
      pop()
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
    for (let i = 0, l = this.sensors.length, s, x, y; i < l; i++) {
      s = this.sensors[i]
      x = s.v.x
      y = s.v.y
      let count = 0
      while (!circuit.checkPoint(x, y) && count < 1000) {
        count++
        if (s.v.x > this.position.x) {
          x--
          y = this.fx(this.position.x, this.position.y, s.v.x, s.y, x)
          if (x < this.position.x) count += 2000
        } else if (s.v.x < this.position.x) {
          x++
          y = this.fx(this.position.x, this.position.y, s.v.x, s.y, x)
          if (x > this.position.x) count += 2000
        } else if(s.v.y > this.position.y) {
          y--
          x = this.fy(this.position.x, this.position.y, s.v.x, s.v.y, y)
          if (y < this.position.y) count += 2000
        } else if(s.v.y < this.position.y) {
          y++
          x = this.fy(this.position.x, this.position.y, s.v.x, s.v.y, y)
          if (y > this.position.y) count += 2000
        } else {
          count += 2000
        }
      }
      console.log('PUSH', x, y, circuit.checkPoint(x, y), count)
      obstacles.push({ x, y })
    }
    return obstacles
  }

  this.fx = function (x1, y1, x2, y2, x) {
    if (x2 - x1 === 0) return y2
    const a = (y2 - y1) / (x2 - x1)
    const b = y1 - a * x1
    console.log('y = ' + a + '*x + ' + b)
    return a * x + b
  }

  this.fy = function (x1, y1, x2, y2, y) {
    if (x2 - x1 === 0) return 0
    const a = (y2 - y1) / (x2 - x1)
    const b = y1 - a * x1
    console.log('x = (y - ' + b + ') / ' + a)
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
    this.obstacles = this.sense(circuit)
  }
}
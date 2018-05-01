const ACTIONS_STRING = [
  'up',
  'upright',
  'upleft',
  'down',
  'downright',
  'downleft'
]

function Car (x, y, brain, isBest, isTest) {
  console.log('CREATE CAR', x, y)
  this.position = createVector(x, y)
  this.oldPosition
  this.r = 5
  this.heading = 0
  this.rotation = 0
  this.reverse = false

  this.nbSensors = 5

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

  this.oneHotEncode = function (type){
    const zeros = Array.apply(null, Array(ACTIONS_STRING.length)).map(Number.prototype.valueOf, 0);
    const index = ACTIONS_STRING.indexOf(type);
    zeros[index] = 1;
    return zeros;
  }

  this.oneHotDecode = function (zeros){
    const max = Math.max.apply(null, zeros);
    const index = zeros.indexOf(max);
    return ACTIONS_STRING[index];
  }

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
    rotate(this.heading)
    triangle(-this.r, -this.r, -this.r, this.r, this.r, 0)
    if (this.test || this.best) {
      for (let i = 0, l = this.sensors.length, s, sv, ov; i < l; i++) {
        s = this.sensors[i]
        stroke(0, 255, 0)
        sv = createVector(this.seight * cos(s.angle), this.seight * sin(s.angle))
        line(0, 0, sv.x, sv.y)
      }
    }
    pop ()
    if (this.test || this.best) {
      for (let i = 0, l = this.obstacles.length, o; i < l; i++) {
        o = this.obstacles[i]
        if (!o) continue
        x = this.position.x + o.d * cos(o.a)
        y = this.position.y + o.d * sin(o.a)
        stroke(255, 0, 0)
        ellipse(x, y, 5, 5)
      }
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

  this.calculateFitness = function () {
    this.fitness = 1
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

  this.setSensors = function (x, y) {
    this.sensors = []
    this.obstacles = []
    for (let i = 0, xs, ys, a; i < this.nbSensors; i++) {
      a = (-HALF_PI + i * QUARTER_PI + this.heading)
      xs = x + this.seight * cos(a)
      ys = y + this.seight * sin(a)
      this.sensors.push({ angle: a, v: createVector(xs, ys) })
    }
  }
  this.setSensors(x, y)

  this.sense = function (circuit) {
    const obstacles = []
    for (let i = 0, a, x, y, n, obs, found; i < this.nbSensors; i++) {
      a = (-HALF_PI + i * QUARTER_PI + this.heading)
      d = this.seight * 1
      n = this.seight * 1 / 2
      obs = null
      found = false
      hasOne = false
      minus = true
      while (n > SEIGHT_PAS) {
        x = this.position.x + d * cos(a)
        y = this.position.y + d * sin(a)
        if (circuit.checkPoint(x, y)) {
          d += n
        } else {
          d -= n
          obs = { d, a }
        }
        n = n / 2
      }
      if (obs) {
        obstacles.push(obs)
      } else {
        obstacles.push(null)
      }
    }
    return obstacles
  }

  this.think = function (circuit) {
    if (this.killed) return
    this.obstacles = this.sense(circuit)
    const v = this.velocity.copy()
    const p = this.position.copy()
    v.normalize()
    p.normalize()
    const inputs = [
      v.x,
      v.y,
      p.x,
      p.y,
      this.heading / PI
    ]
    this.obstacles.forEach(o => {
      if (o && o.d) {
        inputs.push(o.d / this.seight)
      } else {
        inputs.push(0)
      }
    })
    const outputs = this.brain.activate(inputs)
    const label = this.oneHotDecode(outputs)
    // console.log('CAR', label)
    switch (label) {
      case 'up':
        this.breaking(false)
        this.boosting(true)
        this.setRotation(0)
        break;
      case 'upleft':
        this.breaking(false)
        this.boosting(true)
        this.setRotation(-TURN_ANGLE)
        break;
      case 'upright':
        this.breaking(false)
        this.boosting(true)
        this.setRotation(TURN_ANGLE)
        break;
      case 'down':
        this.breaking(true)
        this.boosting(false)
        this.setRotation(0)
        break;
      case 'downleft':
        this.breaking(true)
        this.boosting(false)
        this.setRotation(-TURN_ANGLE)
        break;
      case 'downright':
        this.breaking(true)
        this.boosting(false)
        this.setRotation(-TURN_ANGLE)
        break;
    }
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
    circuit.checkCar(this)
    if (this.reverse) {
      this.score--
    } else {
      this.score++
    }
    if (this.test && circuit) this.obstacles = this.sense(circuit)
  }
}

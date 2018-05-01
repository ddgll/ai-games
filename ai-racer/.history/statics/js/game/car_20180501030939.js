const ACTIONS_STRING = [
  'up',
  'upright',
  'upleft',
  'down'
]

function Car (x, y, brain, isBest, isTest) {
  this.position = createVector(x, y)
  this.oldPosition = createVector(x, y)
  this.r = 5
  this.heading = 0
  this.rotation = 0
  this.reverse = false

  this.chronos = []
  this.checkpoints = Math.floor(DEFAULT_CIRCUIT_SIZE / 5)

  this.nbSensors = 8

  this.seight = DEFAULT_ROAD_WIDTH * 1

  this.nomoves = 0

  this.currentIndex = 0

  // this.angles = [ -QUARTER_PI, 0, QUARTER_PI, -QUARTER_PI + QUARTER_PI / 2, QUARTER_PI - QUARTER_PI / 2, -HALF_PI, HALF_PI, -PI, -PI + QUARTER_PI, -PI - QUARTER_PI ]
  // this.angles = [ -QUARTER_PI, 0, QUARTER_PI, -HALF_PI - QUARTER_PI, HALF_PI + QUARTER_PI ]
  this.angles = [ -QUARTER_PI, 0, QUARTER_PI, -HALF_PI, HALF_PI ]
  // this.angles = [ 0 ]
  this.obstacles = [ ]
  this.angles.forEach(a => this.obstacles.push(null))

  this.velocity = createVector(0, 0)
  this.isBoosting = false
  this.isBreaking = false

  this.killed = false
  this.debug = false
  this.first = false

  this.distance = 0

  this.best = isBest
  this.test = isTest

  this.bestScoreFrame = 0
  this.score = 0
  this.bestScore = 0
  this.frames = 0
  this.fitness = 0
  this.roadsIndex = 0
  this.turns = 0

  this.normalizedPosition = createVector(0, 0)

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
      stroke(255, 255, 0)
      fill(255, 255, 0)
    } else if (this.first) {
      stroke(0, 255, 0)
      fill(0, 255, 0)
    } else {
      stroke(255)
      fill(255, 50)
    }
    if (this.reverse) stroke(255, 0, 0)
    push()
    translate(this.position.x, this.position.y)
    rotate(this.heading)
    triangle(-this.r, -this.r, -this.r, this.r, this.r, 0)
    pop ()
    if (this.test || this.best || this.first) {
      if (this.test) this.obstacles = this.sense(circuit)
      if (this.test || this.first) {
        fill(255, 255, 255, 50)
        ellipse(this.normalizedPosition.x, this.normalizedPosition.y, 5, 5)
      }
      for (let i = 0, l = this.obstacles.length, o; i < l; i++) {
        o = this.obstacles[i]
        if (!o) continue
        stroke(255)
        stroke(255, 0, 0)
        ellipse(o.x, o.y, 5, 5)
      }
      // this.chronos.forEach(c => {
      //   fill(255, 255, 0)
      //   strokeWeight(5)
      //   point(c.x, c.y)
      // })
    }
  }

  this.crash = function () {
    this.velocity = createVector(0, 0)
    this.heading = 0
    this.rotation = 0
    this.isBoosting = false
    this.isBreaking = false
    this.killed = true
  }

  this.calculateFitness = function () {
    if (this.frames === 0) return 0
    this.fitness = this.score // * (1 + 1 / this.frames)
    return this.fitness
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
    force.mult(BOOST_FORCE)
    this.velocity.add(force)
  }

  this.break = function () {
    if (this.killed) return
    const force = p5.Vector.fromAngle(this.heading)
    force.mult(BREAK_RESISTENCE)
    this.velocity.sub(force)
  }

  this.getVectorSensor = function (angle, x, y) {
    xs = x + this.seight * cos(angle)
    ys = y + this.seight * sin(angle)
    return createVector(xs, ys)
  }

  this.setObstacle = function (obs, d, a) {
    if (!obs) return { d, a }
    if (d < obs.d) return { d, a }
    return obs
  }

  this.sense = function (circuit) {
    if (this.score === 0) return []
    if (this.killed) return []
    const obstacles = []
    for (let i = 0, l = this.angles.length, a, x, y, n, obs; i < l; i++) {
      a = this.angles[i] + this.heading // (-HALF_PI + i * QUARTER_PI + this.heading)
      d = this.seight
      sv = this.getVectorSensor(a, this.position.x, this.position.y)
      if (this.test) {
        stroke(0, 255, 0)
        line(this.position.x, this.position.y, sv.x, sv.y)
      }
      obs = circuit.checkLine(this.position.x, this.position.y, sv.x, sv.y, this.currentIndex, this.seight, a)
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
    const v = this.velocity.copy()
    const p = this.position.copy()
    v.normalize()
    p.normalize()
    const inputs = [
      (v.x + 1) / 2,
      (v.y + 1) / 2,,
      this.velocity.mag(),
      p.x,
      p.y,
      this.reverse ? 0 : 1,
      (this.heading + 2 * PI) / (2 * PI + 2 * PI)
    ]
    this.obstacles = this.sense(circuit)
    this.obstacles.forEach(o => {
      if (o && o.d) {
        inputs.push((o.d / this.seight) / 2)
      } else {
        inputs.push(1)
      }
    })
    this.outputs = this.brain.activate(inputs)
    this.label = this.oneHotDecode(this.outputs)
    if (this.test) {
      console.log('INPUTS', this.oneHotEncode(this.label), this.obstacles.map(o => o && o.d ? o.d / this.seight : 1), this.label, inputs)
      return this.label
    }
    inputs.forEach((i, iids) => {
      if (i < 0 || i > 1) {
        console.log('INPUTS NON NORMALISE !!', i, iids)
      }
    })
    // console.log('CAR', label)
    switch (this.label) {
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
    }
  }

  this.turn = function () {
    if (this.killed) return
    this.heading += this.rotation
    this.heading = this.heading % (2 * PI)
  }
  
  this.checkDistance = function (road, index, distance, totalDistance) {
    if (!this || !this.position || !this.oldPosition) return false
    if (this.test) {
      const x = this.position.x
      const y = this.position.y
      const np = road.getNormalizedPosition(x, y)
      this.normalizedPosition = createVector(np.x, np.y)
    }
    if (this.roadsIndex === DEFAULT_CIRCUIT_SIZE - 1 && index === 0) {
      this.turns++
    }
    const dist = distance + this.turns * totalDistance
    // if (index % this.checkpoints === 0 && (this.distance > totalDistance || index > 0) && this.currentIndex !== index) {
    //   const old = this.chronos.length ? this.chronos.map(c => c.frames).reduce((a, b) => a + b) : 0
    //   this.chronos.push({ index, x, y, frames: this.frames - old })
    // }
    if (dist >= this.distance) {
      this.reverse = false
    } else {
      this.reverse = true
    }
    this.distance = dist
    this.currentIndex = index
    if (index === this.roadsIndex || index === this.roadsIndex + 1 || (this.roadsIndex === DEFAULT_CIRCUIT_SIZE - 1 && index === 0)) {
      this.score = this.distance * (1 + 1 / this.frames)
      if(this.score > this.bestScore) {
        this.roadsIndex = index
        this.bestScore = this.score
        this.bestScoreFrame = this.frames
      }
    } else if (!this.test) {
      this.crash()
    }
  }

  this.update = function (circuit) {
    if (this.killed) return
    this.velocity.mult(AIR_RESISTENCE)
    this.frames++
    if (!this.test && this.bestScoreFrame && this.frames - this.bestScoreFrame > 100) {
      this.crash()
    }
    if (this.frames > (this.turns + 1) * 5000 || this.turns >= 3) this.crash()
    this.turn()
    if (this.isBoosting) {
      this.boost()
    }
    if (this.isBreaking) {
      this.break()
    }
    this.position.add(this.velocity)
    circuit.checkCar(this)
    // if (this.test && circuit) this.obstacles = this.sense(circuit)
  }
}

const ACTIONS_STRING = [
  'up',
  'upright',
  'upleft',
  'down',
  'downright',
  'downleft',
  'right',
  'left',
  'nothing'
]

const states = 9
const actions = ACTIONS_STRING.length
const temporalWindow = 1
const input = states + temporalWindow * (states + actions)

console.log('Input', input)

function Car (x, y, savedBrain, isBest, isTest) {
  this.id = uuid()
  this.r = 5

  // this.angles = [ -QUARTER_PI, 0, QUARTER_PI, QUARTER_PI / 6, - QUARTER_PI / 6, QUARTER_PI / 2, - QUARTER_PI / 2, -HALF_PI, HALF_PI, -PI + QUARTER_PI, -PI - QUARTER_PI ]
  this.angles = [ -QUARTER_PI, 0, QUARTER_PI, -HALF_PI - QUARTER_PI, HALF_PI + QUARTER_PI ]
  // this.angles = [ -QUARTER_PI, 0, QUARTER_PI, -HALF_PI, HALF_PI ]
  // this.angles = [ 0 ]

  this.best = isBest
  this.test = isTest

  this.contact = 0
  this.impact = 0
  this.optimal = 1
  this.sens = 1
  this.log = document.getElementById('chart')
  this.training = true

  if (!isTest) {
    // this.brain = new ActorCritic(states, ACTIONS_STRING.length, {
    //   hidden1Size: states,
    //   hidden2Size: Math.round(states / 2)
    // })
    this.brain = new neurojs.Agent({
      type: 'q-learning', // q-learning or sarsa
      actor: new neurojs.Network.Model([
        { type: 'input', size: input },
        { type: 'fc', size: input, activation: 'relu' },
        { type: 'fc', size: input, activation: 'relu' },
        { type: 'fc', size: input, activation: 'relu', dropout: 0.50 },
        { type: 'fc', size: actions, activation: 'tanh' },
        { type: 'softmax' }
      ]),
      critic: new neurojs.Network.Model([
        { type: 'input', size: input + actions },
        { type: 'fc', size: input + actions, activation: 'relu' },
        { type: 'fc', size: input + actions, activation: 'relu' },
        { type: 'fc', size: 1 },
        { type: 'regression' }
      ]),

      states: states,
      actions: actions,

      algorithm: 'ddpg', // ddpg or dqn

      temporalWindow: temporalWindow,

      discount: 0.97, 

      experience: 75e3,
      learningPerTick: 40,
      startLearningAt: 900,

      theta: 0.05, // progressive copy

      alpha: 0.5 // advantage learning
    })
  } else {
    this.brain = null
  }

  this.reset = function (x, y) {
    this.bestScoreFrame = 0
    this.score = 0
    this.bestScore = 0
    this.frames = 0
    this.fitness = 0
    this.roadsIndex = 0
    this.contact = 0
    this.impact = 0
    this.turns = 0
    this.lturns = 0
    this.position = createVector(x, y)
    this.oldPosition = createVector(x, y)
    this.oldOldPosition = createVector(x, y)
    this.normalizedPosition = createVector(0, 0)
    this.heading = 0
    this.oldHeading = 0
    this.rotation = 0
    this.oldRotation = 0
    this.optimal = 1
    this.sens = 1
    this.reverse = false
    this.chronos = []
    this.first = false
    this.distance = 0
    this.oldDistance = 0
    this.obstacles = []
    this.angles.forEach(a => this.obstacles.push(null))
    this.velocity = createVector(0, 0)
    this.oldVelocity = createVector(0, 0)
    this.isBoosting = false
    this.isBreaking = false
    this.currentIndex = 0
    this.checkpoints = Math.floor(DEFAULT_CIRCUIT_SIZE / 5)
    this.seight = DEFAULT_ROAD_WIDTH * 1
    this.reward = -100
  }

  this.reset(x, y)

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
    text(Math.round(this.reward * 1000) / 1000, 0, -10)
    rotate(this.heading)
    triangle(-this.r, -this.r, -this.r, this.r, this.r, 0)
    if (this.road) {
      const points = this.road.getCarPoints(0, 0, this.r)
      triangle(points[0].x, points[0].y, points[1].x, points[1].y, points[2].x, points[2].y)
    }
    pop ()
    push()
    if (this.test) this.obstacles = this.sense(circuit)
    fill(255, 255, 255, 50)
    ellipse(this.normalizedPosition.x, this.normalizedPosition.y, 5, 5)
    for (let i = 0, l = this.obstacles.length, o; i < l; i++) {
      o = this.obstacles[i]
      if (!o) continue
      noStroke()
      fill(255, 0, 0)
      ellipse(o.x, o.y, 5, 5)
    }
    pop()
    for (let i = 0, l = this.angles.length, a, x, y, n, obs; i < l; i++) {
      a = this.angles[i] + this.heading
      d = this.seight
      sv = this.getVectorSensor(a, this.position.x, this.position.y)
      stroke(0, 0, 0, 125)
      line(this.position.x, this.position.y, sv.x, sv.y)
    }

    if (DEBUG) {
      let y = 50
      push()
      translate(circuit.x - 280, circuit.y - 300)
      let roadAngle = 0
      if (this.road) {
        roadAngle = (Math.atan2(this.road.yFin - this.road.y, this.road.xFin - this.road.x) + TWO_PI) % TWO_PI
        text('Road Angle: ' + roadAngle, 50, y)
        y += 50
      }
      text('Heading: ' + (this.heading), 50, y)
      y += 50
      text('RoadAngle - Heading: ' + (roadAngle - this.heading), 50, y)
      y += 50
      text('Optimal: ' + circuit.getOptimalDirectionDiff(this), 250, y)
      pop()
    }
  }

  this.crash = function () {
    this.velocity = createVector(0, 0)
    this.heading = 0
    this.rotation = 0
    this.isBoosting = false
    this.isBreaking = false
    this.reset(X_START, Y_START)
  }

  this.calculateFitness = function () {
    if (this.frames === 0) return 0
    this.fitness = this.score // * (1 + 1 / this.frames)
    return this.fitness
  }

  this.setRotation = function (angle) {
    this.rotation = angle
  }

  this.boosting = function (boosting) {
    this.isBoosting = boosting
  }

  this.breaking = function (breaking) {
    this.isBreaking = breaking
  }

  this.boost = function () {
    const force = p5.Vector.fromAngle(this.heading)
    force.mult(BOOST_FORCE)
    this.velocity.add(force)
  }

  this.break = function () {
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
    const obstacles = []
    // if (!this.road) {
    //   for (let i = 0, l = this.angles.length; i < l; i++) obstacles.push(1)
    //   return obstacles
    // }
    for (let i = 0, l = this.angles.length, a, obs; i < l; i++) {
      a = ((this.angles[i] + this.heading) + TWO_PI) % TWO_PI // (-HALF_PI + i * QUARTER_PI + this.heading)
      sv = this.getVectorSensor(a, this.position.x, this.position.y)
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
    const inputs = []
    let norm
    this.proximity = 0
    this.obstacles = this.sense(circuit)
    this.obstacles.forEach(o => {
      if (o && o.d) {
        norm = normalize(o.d, 0, this.seight)
        this.proximity += norm
        inputs.push(normalize(o.d, 0, this.seight))
      } else {
        this.proximity += 1
        inputs.push(1)
      }
    })
    this.proximity = this.proximity / this.obstacles.length

    inputs.push(normalize(this.heading, -TWO_PI, TWO_PI))
    inputs.push(normalize(this.optimal, 0, TWO_PI))
    inputs.push(this.reverse ? 0 : 1)
    inputs.push(normalize(this.velocity.mag(), 0, 3))
    inputs.forEach((i, iids) => {
      if (i < 0 || i > 1) {
        console.log('INPUTS NON NORMALISE !!', i, iids, inputs.length, this.velocity.mag())
      }
    })
    this.inputs = inputs
    const outputs = this.brain.policy(inputs)
    this.outputs = outputs
    this.label = this.oneHotDecode(this.outputs)
    this.act()
    return this.oneHotDecode(outputs)

    // return this.brain.step(inputs, this.reward, this.dead, true).then((outputs) => {
    // // return Promise.resolve(this.brain.act(inputs)).then(outputs => {
    //   this.outputs = outputs
    //   this.label = this.oneHotDecode(this.outputs)
    //   // this.label = ACTIONS_STRING[this.outputs]
    //   this.act()
    //   return this.label
    // })
  }

  this.act = function () {
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
      case 'left':
        this.breaking(false)
        this.boosting(false)
        this.setRotation(-TURN_ANGLE)
        break;
      case 'right':
        this.breaking(false)
        this.boosting(false)
        this.setRotation(TURN_ANGLE)
        break;
      case 'down':
        this.breaking(true)
        this.boosting(false)
        this.setRotation(0)
        break;
      case 'downright':
        this.breaking(true)
        this.boosting(false)
        this.setRotation(TURN_ANGLE)
        break;
      case 'downleft':
        this.breaking(true)
        this.boosting(false)
        this.setRotation(-TURN_ANGLE)
        break;
      case 'nothing':
        this.breaking(false)
        this.boosting(false)
        this.setRotation(0)
        break;
    }
  }

  this.calcReward = function (circuit) {
    this.reward = 0
    const collide = circuit.checkCar(this)
    if (this.turn > this.lturns) {
      this.reward = 1
    } else if (this.reverse) {
      this.reward = -0.5
    } else {
      this.reward = this.isBreaking ? 0 : normalize(this.velocity.mag(), 0, 5)
      if (this.reward > 0 && this.velocity.mag() < 1e-2) this.reward = -0.1
    }
    if (collide) {
      this.reward = -1
      return collide
    }
    // if (this.velocity.mag() < 1e-2 || this.isBreaking) {
    //   this.reward = 0
    //   return collide
    // }
    return collide

    // if (this.velocity.mag() < 1e-2) {
    //   this.reward = normalize(this.optimal, 0, 15) / 2
    // } else {
    //   this.reward += this.optimal
    //   this.reward = normalize(this.reward, 0, 15)
    // }
    // if (this.reverse > (Math.PI / 4)) this.reward *= -1
    // return collide
  }

  this.turn = function () {
    this.heading += this.rotation + TWO_PI
    this.heading = this.heading % TWO_PI
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
    this.distance = dist
    this.currentIndex = index
    if (index === this.roadsIndex || index === this.roadsIndex + 1 || (this.roadsIndex === DEFAULT_CIRCUIT_SIZE - 1 && index === 0)) {
      this.score = this.distance * (1 + 1 / this.frames)
      if(this.score > this.bestScore) {
        this.roadsIndex = index
        this.bestScore = this.score
        this.bestScoreFrame = this.frames
      }
    }
  }

  this.update = function (circuit) {
    this.frames++
    const d = Date.now()
    if (this.brain) this.think(circuit)
    this.velocity.mult(AIR_RESISTENCE)
    this.oldDistance = this.distance * 1
    this.oldHeading = this.heading * 1
    this.oldVelocity = this.velocity.copy()
    this.oldPosition = this.position.copy()
    this.oldRotation = this.rotation * 1
    this.turn()
    if (this.isBoosting) this.boost()
    if (this.isBreaking) this.break()
    this.position.add(this.velocity)
    const collide = this.calcReward(circuit)
    if (this.brain && this.training) {
      const loss = this.brain.learn(this.reward)
      const f = Date.now()
      if (this.log) this.log.innerHTML = `
        <div style="float: right; width: 33%;">INPUTS<pre>${JSON.stringify(this.inputs, null, 2)}</pre></div>
        <div style="float: right; width: 33%;">OUTPUTS: ${this.label}<pre>${JSON.stringify(this.outputs, null, 2)}</pre></div>
        <br>
        Time: ${f - d}ms<br>
        Loss: ${loss}<br>
        Reward: ${this.reward}<br>
        Age: ${this.brain.age}`
    }
    if (collide) {
      this.distance = this.oldDistance * 1
      this.heading = this.oldHeading * 1
      this.rotation = this.oldRotation * 1
      this.position = this.oldPosition.copy()
      this.velocity.mult(-1)
      this.position.add(this.velocity)
      this.velocity = createVector(0, 0)
    }
  }
}

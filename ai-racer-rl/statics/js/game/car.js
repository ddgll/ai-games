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

const states = 13
const actions = ACTIONS_STRING.length
var env = {
  getNumStates: function() {
    return states;
  },
  getMaxNumActions: function() {
    return actions;
  }
};

var spec = {};
spec.update = 'sarsa'; // qlearn | sarsa
spec.gamma = 0.9; // discount factor, [0, 1)
spec.epsilon = 0.2; // initial epsilon for epsilon-greedy policy, [0, 1)
spec.alpha = 0.005; // value function learning rate
spec.experience_add_every = 5; // number of time steps before we add another experience to replay memory
spec.experience_size = 15000; // size of experience
spec.learning_steps_per_iteration = 5;
spec.tderror_clamp = 1.0; // for robustness
spec.num_hidden_units = 100 // number of neurons in hidden layer

function Car (x, y, savedBrain, isBest, isTest) {
  this.id = uuid()
  this.r = 5

  this.angles = [ -QUARTER_PI, 0, QUARTER_PI, QUARTER_PI / 6, - QUARTER_PI / 6, QUARTER_PI / 2, - QUARTER_PI / 2, -HALF_PI, HALF_PI, -PI + QUARTER_PI, -PI - QUARTER_PI ]
  // this.angles = [ -QUARTER_PI, 0, QUARTER_PI, -HALF_PI - QUARTER_PI, HALF_PI + QUARTER_PI ]
  // this.angles = [ -QUARTER_PI, 0, QUARTER_PI, -HALF_PI, HALF_PI ]
  // this.angles = [ 0 ]

  this.best = isBest
  this.test = isTest

  this.contact = 0
  this.impact = 0
  this.optimal = 1
  this.sens = 1

  if (!isTest) {
    // this.brain = new ActorCritic(states, ACTIONS_STRING.length, {
    //   hidden1Size: states,
    //   hidden2Size: states / 2
    // })
    this.brain = new RL.DQNAgent(env, spec);
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
    this.position = createVector(x, y)
    this.oldPosition = createVector(x, y)
    this.oldOldPosition = createVector(x, y)
    this.normalizedPosition = createVector(0, 0)
    this.heading = 0
    this.rotation = 0
    this.optimal = 1
    this.sens = 1
    this.reverse = false
    this.chronos = []
    this.first = false
    this.distance = 0
    this.obstacles = []
    this.angles.forEach(a => this.obstacles.push(null))
    this.velocity = createVector(0, 0)
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
    if (this.reverse > (Math.PI / 4)) stroke(255, 0, 0)
    push()
    translate(this.position.x, this.position.y)
    text(Math.round(this.reward * 1000) / 1000, 0, -10)
    rotate(this.heading)
    triangle(-this.r, -this.r, -this.r, this.r, this.r, 0) 
    pop ()
    if (this.test || this.best || this.first) {
      push()
      if (this.test) this.obstacles = this.sense(circuit)
      if (this.test || this.first) {
        fill(255, 255, 255, 50)
        ellipse(this.normalizedPosition.x, this.normalizedPosition.y, 5, 5)
      }
      for (let i = 0, l = this.obstacles.length, o; i < l; i++) {
        o = this.obstacles[i]
        if (!o) continue
        noStroke()
        fill(255, 0, 0)
        ellipse(o.x, o.y, 5, 5)
      }
      // this.chronos.forEach(c => {
      //   fill(255, 255, 0)
      //   strokeWeight(5)
      //   point(c.x, c.y)
      // })
      pop()
    }
    for (let i = 0, l = this.angles.length, a, x, y, n, obs; i < l; i++) {
      a = this.angles[i] + this.heading
      d = this.seight
      sv = this.getVectorSensor(a, this.position.x, this.position.y)
      stroke(0, 0, 0, 125)
      line(this.position.x, this.position.y, sv.x, sv.y)
    }

    if (this.test) {
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
    this.obstacles = this.sense(circuit)
    this.obstacles.forEach(o => {
      if (o && o.d) {
        inputs.push(normalize(o.d, 0, this.seight))
      } else {
        inputs.push(1)
      }
    })
    inputs.push(this.reverse)
    // inputs.push(this.optimal > .75 ? 1 : 0)
    inputs.push(this.velocity.mag() / 50)
    inputs.forEach((i, iids) => {
      if (i < 0 || i > 1) {
        console.log('INPUTS NON NORMALISE !!', i, iids, inputs.length, this.velocity.mag())
      }
    })
    this.inputs = inputs

    // return this.brain.step(inputs, this.reward, this.dead, true).then((outputs) => {
    return Promise.resolve(this.brain.act(inputs)).then(outputs => {
      this.outputs = outputs
      // this.label = this.oneHotDecode(this.outputs)
      this.label = ACTIONS_STRING[this.outputs]
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
      return this.label
    })
  }

  this.calcReward = function (circuit) {
    this.reward = 0
    const collide = circuit.checkCar(this)
    // if (this.reward === -100) {
    //   this.reward = -1
    //   return collide
    // }
    this.reward = normalize(Math.pow(this.velocity.y, 2) - 0.1 * Math.pow(this.velocity.x, 2), 0, 15)
    if (this.velocity.mag() < 1e-2) this.reward = 0
    if (collide) {
      this.reward -= 1
      return collide
    }
    return collide

    if (this.velocity.mag() < 1e-2) {
      this.reward = normalize(this.optimal, 0, 15) / 2
    } else {
      this.reward += this.optimal
      this.reward = normalize(this.reward, 0, 15)
    }
    if (this.reverse > (Math.PI / 4)) this.reward *= -1
    return collide
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

  this.update = async function (circuit) {
    this.velocity.mult(AIR_RESISTENCE)
    this.frames++
    // if (!this.test && this.frames - this.bestScoreFrame > 100) {
    //   this.score /= 2
    //   this.crash()
    // }
    // if (this.frames > (this.turns + 1) * 5000 || this.turns >= 3) this.crash()
    if (this.brain) {
      await this.think(circuit)
    }
    this.oldPosition = this.position.copy()
    this.turn()
    if (this.isBoosting) {
      this.boost()
    }
    if (this.isBreaking) {
      this.break()
    }
    this.position.add(this.velocity)
    const collide = this.calcReward(circuit)
    if (collide) {
      this.position = this.oldPosition
    }
    this.brain.learn(this.reward)
  }
}

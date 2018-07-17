const fs = require('fs')
const path = require('path')
const CONSTANTS = require('../statics/js/constants')
const Bounds = require('../statics/js/bounds')
const Context = require('../statics/js/game/CoreContext')
const Element = require('../statics/js/game/fElement')
const Maths = require('../server/maths')
const neurojs = require('../neurojs/framework')

const DQNAgent = require('../rl.js')

const ACTIONS_STRING = [
  'up',
  'upright',
  'upleft',
  'right',
  'left',
  'upfire',
  'fire'
]

const states = (CONSTANTS.VISION.TOP + CONSTANTS.VISION.BOTTOM) * (CONSTANTS.VISION.SIDE * 2)
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
spec.update = 'qlearn'; // qlearn | sarsa
spec.gamma = 0.9; // discount factor, [0, 1)
spec.epsilon = 0.2; // initial epsilon for epsilon-greedy policy, [0, 1)
spec.alpha = 0.02; // value function learning rate
spec.experience_add_every = 100; // number of time steps before we add another experience to replay memory
spec.experience_size = 10000; // size of experience
spec.learning_steps_per_iteration = 40;
spec.tderror_clamp = 1.0; // for robustness
spec.num_hidden_units = 1500 // number of neurons in hidden layer

module.exports = class Bot {
  constructor (context, brainFile = './bots/best-bot.bin') {
    const saved = path.resolve(brainFile)
    let savedBrain = null
    // if (fs.existsSync(saved)){
    //   const data = fs.readFileSync(saved)
    //   if (data) {
    //     try {
    //       savedBrain = neurojs.NetOnDisk.readMultiPart(data.buffer)
    //       if (savedBrain) console.log('SAVED BRAIN OK')
    //     } catch (e) {
    //       savedBrain = null
    //     }
    //   }
    // }
    const d = new Date()
    this.session = d.toISOString().replace(/[T:\.]{1}/g, '-').replace(/\-[0-9]+\-[0-9]+\-[0-9]+Z$/, '')
    this.sessionDir = path.resolve(`./brains/${this.session}`)
    if (!fs.existsSync(this.sessionDir)) fs.mkdirSync(this.sessionDir)

    this.seight = CONSTANTS.PLANET_MAX_RADIUS
    this.brain = new DQNAgent(env, spec)

    this.lastX = 0
    this.lastY = 0

    this.setFirstContext(context)

    this.reward = 0.0
    this.loss = 0.0

    this.life = CONSTANTS.MAX_LIFE

    this.bestScore = 0
    this.oldMe = null

    this.outputs = null
    this.label = null

    this.obstacles = []

    this.lastLife = CONSTANTS.MAX_LIFE
    this.lastScore = 0
  }

  onE (epsilon) {
    this.brain.epsilon = epsilon
  }

  update (frames) {
    const shipsId = this.context.update()
    // console.log('shipsId', shipsId, this.me)
    if (!this.me || !this.me.id) return true
    const index = shipsId.indexOf(this.me.id)
    // console.log('UPDATE BOT', shipsId, index)
    if (index < 0) return false
    this.x = parseFloat(this.context.ships[this.me.id].context.x)
    this.y = parseFloat(this.context.ships[this.me.id].context.y)
    this.rotation = parseFloat(this.context.ships[this.me.id].context.a)
    this.life = parseFloat(this.context.ships[this.me.id].context.l)
    this.score = parseFloat(this.context.ships[this.me.id].context.s)
    this.god = parseFloat(this.context.ships[this.me.id].context.g)
    if (this.label) this.calcReward()
    // console.log(this.x, this.y, this.rotation, this.life)
    return true
  }

  setFirstContext (data) {
    if (this.me && this.me.s) {
      const score = parseInt(this.me.s)
      if (score > this.bestScore && score > 100) {
        const d = new Date()
        const binary = this.brain.export()
        const name = `${this.sessionDir}/brain-${d.getTime()}-${Math.round(score)}.bin`
        const bestname = `${this.sessionDir}/best-brain.bin`
        const blob = new DataView(binary).buffer
        fs.writeFile(path.resolve(name), new Buffer(blob), () => {})
        fs.writeFile(path.resolve(bestname), new Buffer(blob), () => {})
        console.log('SAVE New best score', score)
      }
    }

    const context = new Context(data, null, null, CONSTANTS, Element)
    for (let i = 0, l = data.context.s.length, s; i < l; i++) {
      s = data.context.s[i]
      context.ships[s.id] = new Element(s.id, s)
    }
    for (let i = 0, l = data.context.p.length, p; i < l; i++) {
      p = data.context.p[i]
      context.planets[p.id] = new Element(p.id, p)
    }
    for (let i = 0, l = data.context.a.length, a; i < l; i++) {
      a = data.context.a[i]
      context.asteroids[a.id] = new Element(a.id, a)
    }
    for (let i = 0, l = data.context.b.length, b; i < l; i++) {
      b = data.context.b[i]
      context.bullets[b.id] = new Element(b.id, b)
    }
    this.lastLife = CONSTANTS.MAX_LIFE
    this.lastScore = 0
    this.context = context
    this.me = context.ships[data.ship.id]
    if (!this.lastX) this.lastX = parseFloat(this.me.context.x)
    if (!this.lastY) this.lastY = parseFloat(this.me.context.y)
    this.x = parseFloat(this.me.context.x)
    this.y = parseFloat(this.me.context.y)
    this.score = parseFloat(this.me.context.s)
    this.god = parseFloat(this.me.context.g)
    this.rotation = parseFloat(this.me.context.a)
  }

  oneHotDecode (zeros){
    // const max = Math.max.apply(null, zeros)
    // const index = zeros.indexOf(max)
    return ACTIONS_STRING[zeros]
  }

  get () {
    if (!this.me || !this.me.id) return
    // const god = parseInt(this.me.g)
    // if (god) return
    return this.action(this.label)
  }
  

  action (label) {
    switch (label) {
      case 'up':
        return [1,0,0]
      case 'upleft':
        return [1,-CONSTANTS.TURN_ANGLE,0]
      case 'upright':
        return [1,CONSTANTS.TURN_ANGLE,0]
      case 'left':
        return [0,-CONSTANTS.TURN_ANGLE,0]
      case 'right':
        return [0,CONSTANTS.TURN_ANGLE,0]
      case 'upfire':
        return [1,0,1]
      case 'fire':
        return [0,0,1]
    }
    return [0,0,0]
  }

  rotate(cx, cy, x, y, angle) {
    // return { x: cx, y: cy }
    const cos = Math.cos(angle),
        sin = Math.sin(angle),
        nx = (cos * (x - cx)) + (sin * (y - cy)) + cx,
        ny = (cos * (y - cy)) - (sin * (x - cx)) + cy;
    return { x: nx - this.x, y: ny - this.y };
  }

  getShipCoordinates (x, y, angle) {
    const a = angle + (Math.PI / 2)
    const xp = (Math.cos(a) * (x - this.x)) + (Math.sin(a) * (y - this.y))
    const yp = (-Math.sin(a) * (x - this.x)) + (Math.cos(a) * (y - this.y))
    return { x: xp, y: yp }
  }

  getNormType (type, shipBullet) {
    switch(type) {
      case 'bo': return -.1
      case 'w': return .8
      case 'p': return .6
      case 'b': return shipBullet ? .4 : .3
      case 's': return .2
      case 'a': return .2
    }
    return .1
  }

  sense (planets, ships, asteroids, bonuses, bullets) {
    const obs = []
    const bounds = new Bounds(CONSTANTS)
    let x, y, r, v, ow, vp
    planets.forEach(p => {
      x = parseFloat(p.context.x)
      y = parseFloat(p.context.y) 
      r = parseFloat(p.context.r)
      v = this.getShipCoordinates(x, y, this.rotation)
      vp = v
      // if (bounds.circleCollide(v.x, v.y, r))
      obs.push({ type: 'p', p: this.getNormType('p'), x: v.x, y: v.y, r })
    })
    ships.forEach(s => {
      if (this.me && +s.id === +this.me.id) return
      x = parseFloat(s.context.x)
      y = parseFloat(s.context.y)
      v = this.getShipCoordinates(x, y, this.rotation)
      // if (bounds.triangleCollide(v.x, v.y, CONSTANTS.SHIP_SIZE))
      obs.push({ type: 's', p: this.getNormType('s'), x: v.x, y: v.y, r: CONSTANTS.SHIP_SIZE })
    })
    asteroids.forEach(a => {
      x = parseFloat(a.context.x)
      y = parseFloat(a.context.y)
      v = this.getShipCoordinates(x, y, this.rotation)
      // if (bounds.circleCollide(v.x, v.y, CONSTANTS.ASTEROID_RADIUS, true))
      obs.push({ type: 'a', p: this.getNormType('a'), x: v.x, y: v.y, r: CONSTANTS.ASTEROID_RADIUS })
    })
    bonuses.forEach(b => {
      x = parseFloat(b.context.x)
      y = parseFloat(b.context.y)
      v = this.getShipCoordinates(x, y, this.rotation)
      // if (bounds.circleCollide(v.x, v.y, CONSTANTS.BONUSES_RADIUS, true))
      obs.push({ type: 'bo', p: this.getNormType('bo'), x: v.x, y: v.y, r: CONSTANTS.BONUSES_RADIUS })
    })
    const reg = /^s[0-9]+$/
    const regrep = /[^0-9]/g
    bullets.forEach(b => {
      // console.log('BULLET', b)
      ow = b.context.o
      if (reg.test(ow) && +ow.replace(regrep, '') === this.me.id) return
      x = parseFloat(b.context.x)
      y = parseFloat(b.context.y)
      v = this.getShipCoordinates(x, y, this.rotation)
      // if (bounds.circleCollide(v.x, v.y, CONSTANTS.BULLET_RADIUS, true))
      obs.push({ type: 'b', p: this.getNormType('b', reg.test(ow)), x: v.x, y: v.y, r: CONSTANTS.BULLET_RADIUS })
    })
    // let p1, p2
    // const wNorm = this.getNormType('w')
    // // Mur gauche
    // p1 = this.getShipCoordinates(0, 0, this.rotation)
    // p2 = this.getShipCoordinates(0, CONSTANTS.HEIGHT, this.rotation)
    // //if (bounds.lineCollide(p1.x, p1.y, p2.x, p2.y) || true) {
    //   //console.log('Mur gauche', this.rotation)
    //   obs.push({ type: 'w', p: wNorm, x1: p1.x, y1: p1.y, x2: p2.x, y2: p2.y })
    // //}
    // // Mur doites
    // p1 = this.getShipCoordinates(CONSTANTS.WIDTH, 0, this.rotation)
    // p2 = this.getShipCoordinates(CONSTANTS.WIDTH, CONSTANTS.HEIGHT, this.rotation)
    // //if (bounds.lineCollide(p1.x, p1.y, p2.x, p2.y) || true) {
    //   //console.log('Mur droite', this.rotation)
    //   obs.push({ type: 'w', p: wNorm, x1: p1.x, y1: p1.y, x2: p2.x, y2: p2.y })
    // //}
    // // // Mur haut
    // p1 = this.getShipCoordinates(0, 0, this.rotation)
    // p2 = this.getShipCoordinates(CONSTANTS.WIDTH, 0, this.rotation)
    // //if (bounds.lineCollide(p1.x, p1.y, p2.x, p2.y) || true) {
    //   //console.log('Mur haut', this.rotation)
    //   obs.push({ type: 'w', p: wNorm, x1: p1.x, y1: p1.y, x2: p2.x, y2: p2.y })
    // //}
    // // // Mur bas
    // p1 = this.getShipCoordinates(0, CONSTANTS.HEIGHT, this.rotation)
    // p2 = this.getShipCoordinates(CONSTANTS.WIDTH, CONSTANTS.HEIGHT, this.rotation)
    // //if (bounds.lineCollide(p1.x, p1.y, p2.x, p2.y) || true) {
    //   //console.log('Mur bas', this.rotation)
    //   obs.push({ type: 'w', p: wNorm, x1: p1.x, y1: p1.y, x2: p2.x, y2: p2.y })
    // //}
    let p1 = this.getShipCoordinates(CONSTANTS.WIDTH / 2, CONSTANTS.HEIGHT / 2, this.rotation)
    // let p1 = this.rotate(0, 0, 0 - this.x, 0 - this.y, Math.PI / 2)
    obs.push({ type: 'w', p: this.getNormType('w'), x: p1.x - CONSTANTS.WIDTH / 2, y: p1.y - CONSTANTS.HEIGHT / 2, w: CONSTANTS.WIDTH, h: CONSTANTS.HEIGHT })
    
    const vision = bounds.getVision(obs)

    this.obstacles = { o: obs, v: vision }

    return vision
  }

  noPoint () {
    return this.dead || this.god
  }

  roundReward (reward) {
    return Math.round(reward * 1000) / 1000
  }

  print (lifeReward, scoreReward, velReward) {
    console.log('REWARDS', this.roundReward(this.reward), this.roundReward(lifeReward), this.roundReward(scoreReward), this.roundReward(velReward))
  }

  calcReward () {
    const me = this.me && this.me.context ? this.me.context : null
    if (!me || !me.id) {
      return null
    }
    const x = this.x
    const y = this.y
    if (!this.lastX) this.lastX = x * 1.0
    if (!this.lastY) this.lastY = y * 1.0
    const life = parseFloat(this.life)
    const score = parseFloat(this.score)
    const distReward = Maths.distance(this.x, this.y, this.lastX, this.lastY)
    const lifeReward = (!this.lastLife || this.lastLife === life) ? 0 : this.lastLife - life
    const scoreReward = (score < 1 || this.lastScore > score) ? 0 : (score - this.lastScore)
    // this.reward += scoreReward - lifeReward * 10 + distReward / 3 // Maths.norm(lifeReward + scoreReward * 2, 0, 3)
    this.reward -= lifeReward
    if ((this.oldMe && me.id !== this.oldMe) || this.lastLife < life) {
      this.reward = -1
    }

    this.oldMe = me.id
    this.lastScore = score * 1.00
    this.lastLife = life * 1
    this.lastX = x * 1.0
    this.lastY = y * 1.0
  }

  think () {
    const ships = Object.values(this.context.ships)
    const planets = Object.values(this.context.planets)
    const bullets = Object.values(this.context.bullets)
    const asteroids = Object.values(this.context.asteroids)
    const bonuses = []
    const squares = this.sense(planets, ships, asteroids, bonuses, bullets)
    const vision = squares.reduce((a, b) => a.concat(b))
    
    // console.log('REWARDS', this.reward, lifeReward, scoreReward)
    const inputs = vision // .concat([ Maths.norm(this.x, 0, CONSTANTS.WIDTH), Maths.norm(this.y, 0, CONSTANTS.HEIGHT), Maths.norm(this.rotation, -Math.PI * 2, Math.PI * 2) ])
    if (this.label && this.brain.epsilon > 0) {
      this.loss = this.brain.learn(this.reward) //this.reward)
      console.log('REWARD', this.reward, this.brain.tderror.toFixed(3))
      this.reward = 1
    }
    this.outputs = this.brain.act(inputs)
    this.label = ACTIONS_STRING[this.outputs]

    if (this.outputs < 0 || this.outputs > (ACTIONS_STRING.length - 1) || isNaN(this.outputs)) console.error('OUTPUT !!!', this.outputs)

    inputs.forEach((ii, idx) => {
      if (ii < 0 || ii > 1 || isNaN(ii)) console.error('INPUT !!!', ii, idx)
    })

    console.log(this.brain.epsilon);
    // console.log(inputs, inputs.length, this.outputs, this.reward, this.label)
    // console.log(this.reward, lifeReward, scoreReward, this.outputs)
    return this.label
  }

  console(d, name, nc) {
    console.log('TIME TO Think qlearn', name, d, 'ms', nc, this.label, this.brain.epsilon)
  }
}

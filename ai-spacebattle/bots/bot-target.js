const fs = require('fs')
const path = require('path')
const CONSTANTS = require('../statics/js/constants')
const Bounds = require('../statics/js/bounds')
const Context = require('../statics/js/game/CoreContext')
const Element = require('../statics/js/game/fElement')
const Maths = require('../server/maths')
const neurojs = require('../neurojs/framework')
const Target = require('./target')
const ACTIONS_STRING = [
  'up',
  'upright',
  'upleft',
  'upfire',
  'fire'
]

const states = (CONSTANTS.VISION.TOP + CONSTANTS.VISION.BOTTOM) * (CONSTANTS.VISION.SIDE * 2)
const actions = 3
const temporalWindow = 1
const input = states + temporalWindow * (states + actions)
const brains = {
  actor: new neurojs.Network.Model([
    { type: 'input', size: input },
    { type: 'fc', size: 50, activation: 'relu' },
    { type: 'fc', size: 50, activation: 'relu' },
    { type: 'fc', size: 50, activation: 'relu', dropout: 0.5 },
    { type: 'fc', size: actions, activation: 'tanh' },
    { type: 'regression' }

  ]),
  critic: new neurojs.Network.Model([
    { type: 'input', size: input + actions },
    { type: 'fc', size: 100, activation: 'relu' },
    { type: 'fc', size: 100, activation: 'relu' },
    { type: 'fc', size: 1 },
    { type: 'regression' }
  ])
}
brains.shared = new neurojs.Shared.ConfigPool()
brains.shared.set('actor', brains.actor.newConfiguration())
brains.shared.set('critic', brains.critic.newConfiguration())

module.exports = class Bot {
  constructor (context, brainFile = './bots/best-bot.bin') {
    const saved = path.resolve(brainFile)
    let savedBrain = null
    if (fs.existsSync(saved)){
      const data = fs.readFileSync(saved)
      if (data) {
        try {
          savedBrain = neurojs.NetOnDisk.readMultiPart(data.buffer)
          if (savedBrain) console.log('SAVED BRAIN OK')
        } catch (e) {
          savedBrain = null
        }
      }
    }
    const d = new Date()
    this.session = d.toISOString().replace(/[T:\.]{1}/g, '-').replace(/\-[0-9]+\-[0-9]+\-[0-9]+Z$/, '')
    this.sessionDir = path.resolve(`./brains/${this.session}`)
    if (!fs.existsSync(this.sessionDir)) fs.mkdirSync(this.sessionDir)

    this.seight = CONSTANTS.PLANET_MAX_RADIUS
    this.brain = new neurojs.Agent({
      type: 'q-learning', // q-learning or sarsa
      actor: savedBrain && savedBrain.actor ? savedBrain.actor.clone() : null,
      critic: savedBrain && savedBrain.critic ? savedBrain.critic : null,

      states: states,
      actions: actions,

      algorithm: 'ddpg', // ddpg or dqn

      temporalWindow: temporalWindow, 

      discount: 0.95, 

      experience: 75e3, 
      learningPerTick: 40, 
      startLearningAt: 900,

      theta: 0.05, // progressive copy

      alpha: 0.1 // advantage learning
    })
    brains.shared.add('actor', this.brain.algorithm.actor)
    brains.shared.add('critic', this.brain.algorithm.critic)
    this.lastX = 0
    this.lastY = 0

    this.target = null

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

  update () {
    const shipsId = this.context.update()
    // console.log('shipsId', shipsId, this.me)
    if (!this.me || !this.me.id) return true
    const index = shipsId.indexOf(this.me.id)
    if (index < 0) return false
    this.x = parseFloat(this.context.ships[this.me.id].context.x)
    this.y = parseFloat(this.context.ships[this.me.id].context.y)
    this.rotation = parseFloat(this.context.ships[this.me.id].context.a)
    this.life = parseFloat(this.context.ships[this.me.id].context.l)
    this.score = parseFloat(this.context.ships[this.me.id].context.s)
    this.god = parseFloat(this.context.ships[this.me.id].context.g)
    this.target.setShipPosition(this.x, this.y, this.rotation)
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
    this.lastX = parseFloat(this.me.context.x)
    this.lastY = parseFloat(this.me.context.y)
    this.x = parseFloat(this.me.context.x)
    this.y = parseFloat(this.me.context.y)
    this.score = parseFloat(this.me.context.s)
    this.god = parseFloat(this.me.context.g)
    this.rotation = parseFloat(this.me.context.a)
    if (this.target) {
      this.target.setShipPosition(this.x, this.y, this.rotation)
    } else {
      this.target = new Target(this.x, this.y, this.rotation)
    }
  }

  oneHotDecode (zeros){
    const max = Math.max.apply(null, zeros)
    const index = zeros.indexOf(max)
    return ACTIONS_STRING[index]
  }

  get () {
    if (!this.me || !this.me.id) return
    const god = parseInt(this.me.g)
    if (god) return [0,0]
    return this.target.action()
  }
  

  action (label) {
    switch (label) {
      case 'up':
        return [1,0,0]
      case 'upleft':
        return [1,-CONSTANTS.TURN_ANGLE,0]
      case 'upright':
        return [1,CONSTANTS.TURN_ANGLE,0]
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
    return { x: nx, y: ny };
  }

  getShipCoordinates (x, y, angle) {
    const xp = (Math.cos(angle) * (x - this.x)) + (Math.sin(angle) * (y - this.y))
    const yp = (-Math.sin(angle) * (x - this.x)) + (Math.cos(angle) * (y - this.y))
    return { x: xp, y: yp }
  }

  getNormType (type) {
    switch(type) {
      case 'bo': return -.1
      case 'w': return .9
      case 'p': return .5
      case 'b': return .2
      case 's': return .4
      case 'a': return .3
    }
    return .1
  }

  sense (planets, ships, asteroids, bonuses, bullets) {
    const obs = []
    const bounds = new Bounds(CONSTANTS)
    let x, y, r, v, ow
    planets.forEach(p => {
      x = parseFloat(p.context.x)
      y = parseFloat(p.context.y) 
      r = parseFloat(p.context.r)
      v = this.getShipCoordinates(x, y, this.rotation)
      if (bounds.circleCollide(v.x, v.y, r)) obs.push({ type: 'p', p: this.getNormType('p'), x: v.x, y: v.y, r })
    })
    ships.forEach(s => {
      if (this.me && +s.id === +this.me.id) return
      x = parseFloat(s.context.x)
      y = parseFloat(s.context.y)
      v = this.getShipCoordinates(x, y, this.rotation)
      if (bounds.triangleCollide(v.x, v.y, CONSTANTS.SHIP_SIZE)) obs.push({ type: 's', p: this.getNormType('s'), x: v.x, y: v.y, r: CONSTANTS.SHIP_SIZE })
    })
    asteroids.forEach(a => {
      x = parseFloat(a.context.x)
      y = parseFloat(a.context.y)
      v = this.getShipCoordinates(x, y, this.rotation)
      if (bounds.circleCollide(v.x, v.y, CONSTANTS.ASTEROID_RADIUS, true)) obs.push({ type: 'a', p: this.getNormType('a'), x: v.x, y: v.y, r: CONSTANTS.ASTEROID_RADIUS })
    })
    bonuses.forEach(b => {
      x = parseFloat(b.context.x)
      y = parseFloat(b.context.y)
      v = this.getShipCoordinates(x, y, this.rotation)
      if (bounds.circleCollide(v.x, v.y, CONSTANTS.BONUSES_RADIUS, true)) obs.push({ type: 'bo', p: this.getNormType('bo'), x: v.x, y: v.y, r: CONSTANTS.BONUSES_RADIUS })
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
      if (bounds.circleCollide(v.x, v.y, CONSTANTS.BULLET_RADIUS, true)) obs.push({ type: 'b', p: this.getNormType('b'), x: v.x, y: v.y, r: CONSTANTS.BULLET_RADIUS })
    })
    let p1, p2
    // Mur gauche
    p1 = this.getShipCoordinates(0, 0, this.rotation)
    p2 = this.getShipCoordinates(0, CONSTANTS.HEIGHT, this.rotation)
    if (bounds.lineCollide(p1.x, p1.y, p2.x, p2.y)) obs.push({ type: 'w', p: this.getNormType('w'), x1: p1.x, y1: p1.y, x2: p2.x, y2: p2.y })
    // Mur doites
    p1 = this.getShipCoordinates(CONSTANTS.WIDTH, 0, this.rotation)
    p2 = this.getShipCoordinates(CONSTANTS.WIDTH, CONSTANTS.HEIGHT, this.rotation)
    if (bounds.lineCollide(p1.x, p1.y, p2.x, p2.y)) obs.push({ type: 'w', p: this.getNormType('w'), x1: p1.x, y1: p1.y, x2: p2.x, y2: p2.y })
    // Mur haut
    p1 = this.getShipCoordinates(0, 0, this.rotation)
    p2 = this.getShipCoordinates(CONSTANTS.WIDTH, 0, this.rotation)
    if (bounds.lineCollide(p1.x, p1.y, p2.x, p2.y)) obs.push({ type: 'w', p: this.getNormType('w'), x1: p1.x, y1: p1.y, x2: p2.x, y2: p2.y })
    // Mur bas
    p1 = this.getShipCoordinates(0, CONSTANTS.HEIGHT, this.rotation)
    p2 = this.getShipCoordinates(CONSTANTS.WIDTH, CONSTANTS.HEIGHT, this.rotation)
    if (bounds.lineCollide(p1.x, p1.y, p2.x, p2.y)) obs.push({ type: 'w', p: this.getNormType('w'), x1: p1.x, y1: p1.y, x2: p2.x, y2: p2.y })
    
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

  think () {
    const ships = Object.values(this.context.ships)
    const planets = Object.values(this.context.planets)
    const bullets = Object.values(this.context.bullets)
    const asteroids = Object.values(this.context.asteroids)
    const bonuses = []
    const me = this.me && this.me.context ? this.me.context : null
    if (!me || !me.id) {
      return null
    }
    const squares = this.sense(planets, ships, asteroids, bonuses, bullets)
    const vision = squares.reduce((a, b) => a.concat(b))
    const angle = parseFloat(me.a)
    const x = parseFloat(me.x)
    const y = parseFloat(me.y)
    this.x = x * 1.00
    this.y = y * 1.00
    if (!this.lastX) this.lastX = x * 1.0
    if (!this.lastY) this.lastY = y * 1.0
    const life = parseFloat(this.life)
    const score = parseFloat(this.score)
    const god = parseInt(this.god)
    // if (god) return
    let lifeReward = (!this.lastLife || this.lastLife === life) ? 1 : god ? 0 : Maths.norm(this.lastLife - life, 0, 10)
    if (lifeReward < 0) lifeReward = 1
    if (lifeReward > 1) lifeReward = 0
    const scoreReward = (score < 1 || this.lastScore > score) ? 0 : (score - this.lastScore)
    this.reward = scoreReward - lifeReward * 10 // Maths.norm(lifeReward + scoreReward * 2, 0, 3)
    if ((this.oldMe && me.id !== this.oldMe) || this.lastLife < life) {
      // console.log('REWARD 0 Because of death')
      this.reward = -1
    }

    this.oldMe = me.id
    this.lastScore = score * 1.00
    this.lastLife = life * 1
    this.lastX = x * 1.0
    this.lastY = y * 1.0

    // console.log('REWARDS', this.reward, lifeReward, scoreReward)
    const inputs = vision
    this.loss = this.brain.learn(this.reward)
    this.outputs = this.brain.policy(inputs)
    // console.log(inputs, inputs.length, this.outputs, this.reward, this.label)
    this.target.setAction(this.outputs)
    // console.log(this.reward, lifeReward, scoreReward, this.brain.age, this.target.vel)
    brains.shared.step()
    return this.label
  }
}

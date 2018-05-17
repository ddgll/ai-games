const fs = require('fs')
const path = require('path')
const CONSTANTS = require('../statics/js/constants')
const Context = require('../statics/js/game/CoreContext')
const Element = require('../statics/js/game/fElement')
const Maths = require('../server/maths')
const neurojs = require('../../../neurojs-master/src/framework')

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
    this.seight = CONSTANTS.PLANET_MAX_RADIUS
    const states = 45
    const actions = 2
    const temporalWindow = 5
    const input = states + temporalWindow * (states + actions)
    const actor = new neurojs.Network.Model([
      { type: 'input', size: input },
      { type: 'fc', size: Math.round(input / 2), activation: 'relu' },
      { type: 'fc', size: Math.round(input / 2), activation: 'relu' },
      { type: 'fc', size: Math.round(input / 2), activation: 'relu', dropout: 0.5 },
      { type: 'fc', size: actions, activation: 'tanh' },
      { type: 'regression' }
    ])
    const critic =new neurojs.Network.Model([
      { type: 'input', size: input + actions },
      { type: 'fc', size: Math.round((input + actions) / 2), activation: 'relu' },
      { type: 'fc', size: Math.round((input + actions) / 2), activation: 'relu' },
      { type: 'fc', size: 1 },
      { type: 'regression' }
    ])
    this.brain = new neurojs.Agent({
      type: 'q-learning', // q-learning or sarsa
      actor: savedBrain ? savedBrain.actor.clone() : actor,
      critic: savedBrain ? savedBrain.critic : critic,

      states: states,
      actions: actions,

      algorithm: 'ddpg', // ddpg or dqn

      temporalWindow: temporalWindow, 

      discount: 0.95, 

      experience: 75e3, 
      learningPerTick: 60, 
      startLearningAt: 1000,

      theta: 0.05, // progressive copy

      alpha: 0.1 // advantage learning
    })
    this.lastX = 0
    this.lastY = 0

    this.setFirstContext(context)

    this.reward = 0.0
    this.loss = 0.0

    this.outputs = null
    this.label = null

    this.lastLife = CONSTANTS.MAX_LIFE
    this.lastScore = 0
  }

  setFirstContext (data) {
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
    this.lastX = parseInt(context.me.x)
    this.lastY = parseInt(context.me.y)
    this.lastLife = CONSTANTS.MAX_LIFE
    this.lastScore = 0
    this.context = context
    console.log('SET NEW ME !!', this.me, context.ships[data.ship.id])
    this.me = context.ships[data.ship.id]
  }

  sense (planets, ships, asteroids, bonuses, bullets) {
    const obs = {
      planets: [],
      ships: [],
      asteroids: [],
      bullets: [],
      bonuses: []
    }
    let result = []
    const sort = (a, b) => a.d - b.d
    const reduce = (a, b) => a.concat(b)
    const vels = Math.sqrt(2) * (CONSTANTS.SHIP_SPEED*2)
    const vela = Math.sqrt(2) * (CONSTANTS.ASTEROID_MAX_SPEED*2)
    const velb = Math.sqrt(2) * (CONSTANTS.BULLET_SPEED*2)
    let d, x, y, r, an, ow, sei, min = Infinity
    planets.forEach(p => {
      x = parseFloat(p.context.x) - this.x
      y = parseFloat(p.context.y) - this.y
      r = parseFloat(p.context.r)
      d = Maths.distance(0, 0, x, y)
      ow = p.o === this.id ? 1 : p.c === this.id ? p.cl / 100 : 0
      sei = this.seight * 4
      if (d < sei) obs.planets.push({
        d: d,
        data: [
        Maths.norm(x, -sei, sei), // 0 - 4
        Maths.norm(y, -sei, sei), // 1 - 5
        Maths.norm(r, CONSTANTS.PLANET_MIN_RADIUS, CONSTANTS.PLANET_MAX_RADIUS), // 2 - 6
        ow === this.id ? 1 : 0 // 3 - 7
      ]})
    })
    obs.planets.sort(sort)
    while (obs.planets.length < 2) obs.planets.push({ d: 0, data: [ 1, 1, 0, 0 ] })
    result = result.concat(obs.planets.slice(0, 2).map(d => d.data).reduce(reduce)) // 8
    ships.forEach(s => {
      if (s.context.id === this.context.me.id) return
      x = parseFloat(s.context.x) - this.x
      y = parseFloat(s.context.y) - this.y
      an = parseFloat(s.context.a)
      d = Maths.distance(0, 0, x, y)
      if (d < this.seight) obs.ships.push({
        d: d,
        data: [
        Maths.norm(x, -this.seight, this.seight), // 8 - 14
        Maths.norm(y, -this.seight, this.seight), // 9 - 15
        Maths.norm(an, -Math.PI * 2, Math.PI * 2), // 10 - 16
        s.g ? 1 : 0 // 13 - 19
      ]})
    })
    obs.ships.sort(sort)
    while (obs.ships.length < 2) obs.ships.push({ d: 0, data: [ 1, 1, 0, 1 ] })
    result = result.concat(obs.ships.slice(0, 2).map(d => d.data).reduce(reduce)) // 10
    asteroids.forEach(a => {
      x = parseFloat(a.context.x) - this.x
      y = parseFloat(a.context.y) - this.y
      d = Maths.distance(0, 0, x, y)
      if (d < this.seight && d < min) obs.asteroids.push({d: d, data: [
        Maths.norm(x, -this.seight, this.seight), // 20 - 24
        Maths.norm(y, -this.seight, this.seight) // 21 - 25
      ]})
    })
    obs.asteroids.sort(sort)
    while (obs.asteroids.length < 2) obs.asteroids.push({ d: 0, data: [ 1, 1 ] })
    result = result.concat(obs.asteroids.slice(0, 2).map(d => d.data).reduce(reduce)) // 6
    bonuses.forEach(b => {
      x = parseFloat(b.context.x) - this.x
      y = parseFloat(b.context.y) - this.y
      d = Maths.distance(0, 0, x, y)
      an = Maths.angleBetween(0, 0, x, y)
      if (d < this.seight) obs.bonuses.push({
        d: d,
        data: [
        Maths.norm(x, -this.seight, this.seight), // 28 - 30
        Maths.norm(y, -this.seight, this.seight) // 29 - 31
      ]})
    })
    obs.bonuses.sort(sort)
    while (obs.bonuses.length < 2) obs.bonuses.push({ d: 0, data: [ 1, 1 ] })
    result = result.concat(obs.bonuses.slice(0, 2).map(d => d.data).reduce(reduce)) // 4
    const reg = /^s[0-9]+$/
    const regrep = /[^0-9]/g
    bullets.forEach(b => {
      // console.log('BULLET', b)
      if (reg.test(ow) && ow.replace(regrep, '') === this.id.replace(regrep, '')) return
      x = parseFloat(b.context.x) - this.x
      y = parseFloat(b.context.y) - this.y
      d = Maths.distance(0, 0, x, y)
      an = Maths.angleBetween(0, 0, x, y)
      if (d < this.seight) obs.bullets.push({
        d: d,
        data: [
        Maths.norm(x, -this.seight, this.seight), // 32 - 36 - 40 - 44
        Maths.norm(y, -this.seight, this.seight) // 33 - 37 - 41 - 45
      ]})
    })
    obs.bullets.sort(sort)
    while (obs.bullets.length < 4) obs.bullets.push({ d: 0, data: [ 1, 1 ] })
    const zero = Maths.norm(0, -this.seight, this.seight)
    result = result.concat(obs.bullets.slice(0, 4).map(d => d.data).reduce(reduce)) // 8
    d = Maths.distance(0, 0, 0, this.y)
    an = Maths.angleBetween(this.x, this.y, 0, this.y)
    if (d < this.seight) {
      result = result.concat([Maths.norm(-this.x, -this.seight, this.seight), zero]) // 48 - 49
    } else {
      result = result.concat([1, 1])
    }
    d = Maths.distance(0, 0, CONSTANTS.WIDTH, this.y)
    an = Maths.angleBetween(this.x, this.y, CONSTANTS.WIDTH, this.y)
    if (d < this.seight) {
      result = result.concat([Maths.norm(CONSTANTS.WIDTH - this.x, -this.seight, this.seight), zero]) // 50 - 51
    } else {
      result = result.concat([1, 1])
    }
    d = Maths.distance(0, 0, this.x, 0)
    an = Maths.angleBetween(this.x, this.y, this.x, 0)
    if (d < this.seight) {
      result = result.concat([zero, Maths.norm(-this.y, -this.seight, this.seight)]) // 52 - 53
    } else {
      result = result.concat([1, 1])
    }
    d = Maths.distance(0, 0, this.x, CONSTANTS.HEIGHT)
    an = Maths.angleBetween(this.x, this.y, this.x, CONSTANTS.HEIGHT)
    if (d < this.seight) {
      result = result.concat([zero, Maths.norm(CONSTANTS.HEIGHT - this.y, -this.seight, this.seight)]) // 54 - 55
    } else {
      result = result.concat([1, 1])
    }
    return result
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
    const me = this.context.me && this.context.me.context ? this.context.me.context : null
    if (!me) return null
    const obstacles = this.sense(planets, ships, asteroids, bonuses, bullets)
    const angle = parseInt(me.a)
    const x = parseInt(me.x)
    const y = parseInt(me.y)
    const MAX_DIST = 60
    this.x = x * 1.00
    this.y = y * 1.00
    const distance = Maths.distance(this.lastX, this.lastY, x, y)
    const life = parseInt(me.l)
    const score = parseInt(me.s)
    const god = parseInt(me.g)
    let lifeReward = (!this.lastLife || this.lastLife === life) ? 1 : 1 - Maths.norm(this.lastLife - life, 0, 100)
    if (lifeReward < 0) lifeReward = 0
    const scoreReward = (god || score < 1 || this.lastScore > score) ? 0 : 1 - (1 / score)
    const velReward = (god || distance < 1 || distance > MAX_DIST) ? 0 : Maths.norm(distance, 0, MAX_DIST)
    // this.reward = Maths.norm(Maths.norm(lifeReward + scoreReward, 0, 2) + velReward, 0, 2)
    this.reward = Maths.norm(lifeReward + velReward, 0, 2)
    // this.reward = this.distance / this.frames // Maths.norm(Maths.magnitude(this.vel.x, this.vel.y), 0, CONSTANTS.SHIP_SPEED)
    // this.print(lifeReward, scoreReward, velReward)

    this.lastScore = score * 1.00
    this.lastLife = life * 1
    this.lastX = x * 1.0
    this.lastY = y * 1.0

    // console.log('REWARDS', lifeReward, scoreReward, velReward, Maths.magnitude(this.vel.x, this.vel.y))
    if (this.reward > 1 || this.reward < 0) {
      console.error('0 > REWARD > 1 !! ARF :(', this.reward, lifeReward, scoreReward, velReward, distance)
    }
    const inputs = [
      Maths.norm(angle, -Math.PI * 2, Math.PI * 2), // 0
      Maths.norm(x, 0, CONSTANTS.WIDTH), // 1
      Maths.norm(y, 0, CONSTANTS.HEIGHT), // 2
      Maths.norm(distance > MAX_DIST ? MAX_DIST : distance, 0, MAX_DIST), // 3
      god ? 1.00 : .00 // 4
    ].concat(obstacles)
    this.loss = this.brain.learn(this.reward)
    this.outputs = this.brain.policy(inputs)
    this.outputs = this.outputs.map(o => {
      const oo = (o + 1) / 2
      if (oo < 0 || oo > 1) console.error('OUTPUT !!!', oo)
      return oo
    })
    inputs.forEach((ii, idx) => {
      if (ii < 0 || ii > 1) console.error('INPUT !!!', ii, idx, x, y)
    })
    // console.log(inputs)
    const coords = { 
      x: Maths.lerp((this.outputs[0] + 1) / 2, 0, CONSTANTS.CANVAS_WIDTH),
      y: Maths.lerp((this.outputs[1] + 1) / 2, 0, CONSTANTS.CANVAS_HEIGHT)
    }
    return coords
  }
}

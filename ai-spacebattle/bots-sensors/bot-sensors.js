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

  getShipCoordinates (x, y, angle) {
    const xp = (Math.cos(angle) * (x - this.x)) + (Math.sin(angle) * (y - this.y))
    const yp = (-Math.sin(angle) * (x - this.x)) + (Math.cos(angle) * (y - this.y))
    return { x: xp, y: yp }
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

    let d, x, y, v, r, an, ow, sei, min = Infinity
    planets.forEach(p => {
      v = this.getShipCoordinates(parseFloat(p.context.x), parseFloat(p.context.y), this.rotation)
      x = parseFloat(v.x)
      y = parseFloat(v.y)
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
      if (this.me && +s.id === +this.me.id) return
      v = this.getShipCoordinates(parseFloat(s.context.x), parseFloat(s.context.y), this.rotation)
      x = parseFloat(v.x)
      y = parseFloat(v.y)
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
      v = this.getShipCoordinates(parseFloat(a.context.x), parseFloat(a.context.y), this.rotation)
      x = parseFloat(v.x)
      y = parseFloat(v.y)
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
      v = this.getShipCoordinates(parseFloat(b.context.x), parseFloat(b.context.y), this.rotation)
      x = parseFloat(v.x)
      y = parseFloat(v.y)
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
      ow = b.context.o
      if (reg.test(ow) && +ow.replace(regrep, '') === this.me.id) return
      v = this.getShipCoordinates(parseFloat(b.context.x), parseFloat(b.context.y), this.rotation)
      x = parseFloat(v.x)
      y = parseFloat(v.y)
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

  getCenterCoords (x, y) {
    let distance
    let xCenter = x - CONSTANTS.CANVAS_WIDTH / 2
    let yCenter = y - CONSTANTS.CANVAS_HEIGHT / 2
    if (x < CONSTANTS.CANVAS_WIDTH / 2) xCenter = x
    if (x > CONSTANTS.WIDTH - CONSTANTS.CANVAS_WIDTH / 2) xCenter = CONSTANTS.CANVAS_WIDTH - CONSTANTS.WIDTH + x
    if (y < CONSTANTS.CANVAS_HEIGHT / 2) yCenter = y
    if (y > CONSTANTS.HEIGHT - CONSTANTS.CANVAS_HEIGHT / 2) yCenter = CONSTANTS.CANVAS_HEIGHT - CONSTANTS.HEIGHT + y
    return { x: xCenter, y: yCenter }
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
    const center = this.getCenterCoords(x, y)
    const inputs = obstacles.concat([
      Maths.norm(angle, -Math.PI * 2, Math.PI * 2), // 0
      Maths.norm(center.x, 0, CONSTANTS.CANVAS_WIDTH), // 1
      Maths.norm(center.y, 0, CONSTANTS.CANVAS_HEIGHT), // 2
      Maths.norm(distance > MAX_DIST ? MAX_DIST : distance, 0, MAX_DIST), // 3
      god ? 1.00 : .00 // 4
    ])
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
    this.obstacles = obstacles
    const coords = { 
      x: Maths.lerp((this.outputs[0] + 1) / 2, 0, CONSTANTS.CANVAS_WIDTH),
      y: Maths.lerp((this.outputs[1] + 1) / 2, 0, CONSTANTS.CANVAS_HEIGHT)
    }
    return coords
  }
}

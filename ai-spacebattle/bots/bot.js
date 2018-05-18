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
    const d = new Date()
    this.session = d.toISOString().replace(/[T:\.]{1}/g, '-').replace(/\-[0-9]+\-[0-9]+\-[0-9]+Z$/, '')
    this.sessionDir = path.resolve(`./brains/${this.session}`)
    if (!fs.existsSync(this.sessionDir)) fs.mkdirSync(this.sessionDir)

    this.seight = CONSTANTS.PLANET_MAX_RADIUS
    const states = 28
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
      type: 'sarsa', // q-learning or sarsa
      actor: savedBrain && savedBrain.actor ? savedBrain.actor.clone() : actor,
      critic: savedBrain && savedBrain.critic ? savedBrain.critic : critic,

      network: savedBrain && savedBrain.network ? savedBrain.network.clone() : actor,

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
    this.rotation = parseFloat(this.me.context.a)
  }

  rotate(cx, cy, x, y, angle) {
    const radians = (Math.PI / 180) * angle,
        cos = Math.cos(angle),
        sin = Math.sin(angle),
        nx = (cos * (x - cx)) + (sin * (y - cy)) + cx,
        ny = (cos * (y - cy)) - (sin * (x - cx)) + cy;
    return { x: nx, y: ny };
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
    let d, x, y, r, v, an, ow, sei, min = Infinity
    planets.forEach(p => {
      x = parseFloat(p.context.x) - this.x
      y = parseFloat(p.context.y) - this.y
      r = parseFloat(p.context.r)
      d = Maths.distance(0, 0, x, y)
      ow = p.o === this.id ? 1 : p.c === this.id ? p.cl / 100 : 0
      sei = this.seight * 4
      if (d < sei) {
        v = Maths.magnitude(x, y, d - r / 2)
        v = this.rotate(0, 0, v.x, v.y, -this.rotation)
        obs.planets.push({
          d: d,
          data: [
          Maths.norm(v.x, -sei, sei), // 0 - 2
          Maths.norm(v.y, -sei, sei) // 1 - 3
        ]})
      }
    })
    obs.planets.sort(sort)
    while (obs.planets.length < 2) obs.planets.push({ d: 0, data: [ 1, 1 ] })
    result = result.concat(obs.planets.slice(0, 2).map(d => d.data).reduce(reduce)) // 8
    ships.forEach(s => {
      if (this.me && +s.id === +this.me.id) return
      x = parseFloat(s.context.x) - this.x
      y = parseFloat(s.context.y) - this.y
      v = this.rotate(0, 0, x, y, -this.rotation)
      x = v.x
      y = v.y
      an = parseFloat(s.context.a)
      d = Maths.distance(0, 0, x, y)
      if (d < this.seight) obs.ships.push({
        d: d,
        data: [
        Maths.norm(x, -this.seight, this.seight), // 4 - 6
        Maths.norm(y, -this.seight, this.seight) // 5 - 7
      ]})
    })
    obs.ships.sort(sort)
    while (obs.ships.length < 2) obs.ships.push({ d: 0, data: [ 1, 1 ] })
    result = result.concat(obs.ships.slice(0, 2).map(d => d.data).reduce(reduce)) // 10
    asteroids.forEach(a => {
      x = parseFloat(a.context.x) - this.x
      y = parseFloat(a.context.y) - this.y
      v = this.rotate(0, 0, x, y, -this.rotation)
      x = v.x
      y = v.y
      d = Maths.distance(0, 0, x, y)
      if (d < this.seight && d < min) obs.asteroids.push({d: d, data: [
        Maths.norm(x, -this.seight, this.seight), // 8 - 10
        Maths.norm(y, -this.seight, this.seight) // 9 - 11
      ]})
    })
    obs.asteroids.sort(sort)
    while (obs.asteroids.length < 2) obs.asteroids.push({ d: 0, data: [ 1, 1 ] })
    result = result.concat(obs.asteroids.slice(0, 2).map(d => d.data).reduce(reduce)) // 6
    bonuses.forEach(b => {
      x = parseFloat(b.context.x) - this.x
      y = parseFloat(b.context.y) - this.y
      d = Maths.distance(0, 0, x, y)
      v = this.rotate(0, 0, x, y, -this.rotation)
      x = v.x
      y = v.y
      if (d < this.seight) obs.bonuses.push({
        d: d,
        data: [
        Maths.norm(x, -this.seight, this.seight), // 12 - 14
        Maths.norm(y, -this.seight, this.seight) // 13 - 15
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
      v = this.rotate(0, 0, x, y, -this.rotation)
      x = v.x
      y = v.y
      if (d < this.seight) obs.bullets.push({
        d: d,
        data: [
        Maths.norm(x, -this.seight, this.seight), // 16 - 18 - 20 - 22
        Maths.norm(y, -this.seight, this.seight) // 17 - 19 - 21 - 23
      ]})
    })
    obs.bullets.sort(sort)
    while (obs.bullets.length < 4) obs.bullets.push({ d: 0, data: [ 1, 1 ] })
    result = result.concat(obs.bullets.slice(0, 4).map(d => d.data).reduce(reduce)) // 8
    result.push(this.x < this.seight ? Maths.norm(this.x, 0, this.seight) : 1) // Mur gauche
    result.push(CONSTANTS.WIDTH - this.x < this.seight ? Maths.norm(CONSTANTS.WIDTH - this.x, 0, this.seight) : 1) // Mur droite
    result.push(this.y < this.seight ? Maths.norm(this.y, 0, this.seight) : 1) // Mur haut
    result.push(CONSTANTS.HEIGHT - this.y < this.seight ? Maths.norm(CONSTANTS.HEIGHT - this.y, 0, this.seight) : 1) // Mur bas
    
    this.obstacles = result

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
    const me = this.me && this.me.context ? this.me.context : null
    if (!me || !me.id) {
      return null
    }
    const obstacles = this.sense(planets, ships, asteroids, bonuses, bullets)
    const angle = parseFloat(me.a)
    const x = parseFloat(me.x)
    const y = parseFloat(me.y)
    const vx = parseFloat(me.vx)
    const vy = parseFloat(me.vy)
    // console.log(me)
    if (!this.lastX) this.lastX = x * 1.0
    if (!this.lastY) this.lastY = y * 1.0
    const MAX_DIST = 60
    this.x = x * 1.00
    this.y = y * 1.00
    const distance = Maths.distance(this.lastX, this.lastY, x, y)
    const life = parseFloat(this.life)
    const score = parseFloat(me.s)
    const god = parseInt(me.g)
    let lifeReward = (!this.lastLife || this.lastLife === life) ? 1 : 1 - Maths.norm(this.lastLife - life, 0, 20)
    if (lifeReward < 0) lifeReward = 0
    if (lifeReward > 1) lifeReward = 1
    const scoreReward = (god || score < 1 || this.lastScore > score) ? 0 : 1 - (1 / score)
    const velReward = (god || distance < 1 || distance > MAX_DIST) ? 0 : Maths.norm(distance, 0, MAX_DIST)
    // this.reward = Maths.norm(Maths.norm(lifeReward + scoreReward, 0, 2) + velReward, 0, 2)
    if (this.oldMe && me.id !== this.oldMe) {
      console.log('REWARD 0 Because of death')
      this.reward = 0.00
    } else {
      this.reward = Math.pow(vy, 2) - 0.1 * Math.pow(vx, 2) - (this.lastScore - score) * 10 - (this.lastLife - life) * 20
      // console.log(this.reward, life, this.lastLife)
      // this.reward = Maths.norm(lifeReward + velReward, 0, 2) * 1.00
    }
    // this.reward = this.distance / this.frames // Maths.norm(Maths.magnitude(this.vel.x, this.vel.y), 0, CONSTANTS.SHIP_SPEED)
    // this.print(lifeReward, scoreReward, velReward)

    this.oldMe = me.id
    this.lastScore = score * 1.00
    this.lastLife = life * 1
    this.lastX = x * 1.0
    this.lastY = y * 1.0

    // console.log('REWARDS', vx, vy, this.reward, Math.pow(vy, 2) - 0.1 * Math.pow(vx, 2), (this.lastScore - score) * 10, (this.lastLife - life) * 20)
    const inputs = [
      Maths.norm(vx, -CONSTANTS.SHIP_SPEED, CONSTANTS.SHIP_SPEED), // 0
      Maths.norm(vy, -CONSTANTS.SHIP_SPEED, CONSTANTS.SHIP_SPEED) // 1
    ].concat(obstacles)
    this.loss = this.brain.learn(this.reward)
    // console.log(obstacles, obstacles.length, this.outputs, this.reward, this.rotation)
    this.outputs = this.brain.policy(obstacles)
    this.outputs = this.outputs.map(o => {
      const oo = (o + 1) / 2
      if (oo < 0 || oo > 1 || isNaN(oo)) console.error('OUTPUT !!!', oo)
      return oo
    })
    obstacles.forEach((ii, idx) => {
      if (ii < 0 || ii > 1 || isNaN(ii)) console.error('INPUT !!!', ii, idx, x, y, vx, vy)
    })
    const coords = { 
      x: Maths.lerp(this.outputs[0], 0, CONSTANTS.CANVAS_WIDTH),
      y: Maths.lerp(this.outputs[1], 0, CONSTANTS.CANVAS_HEIGHT)
    }
    return coords
  }
}

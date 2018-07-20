const fs = require('fs')
const path = require('path')
const CONSTANTS = require('../statics/js/constants')
const Bounds = require('../statics/js/bounds')
const Context = require('../statics/js/game/CoreContext')
const Element = require('../statics/js/game/fElement')
const Maths = require('../server/maths')

module.exports = class Bot {
  constructor (context, brain, type) {
    const d = new Date()
    this.session = d.toISOString().replace(/[T:\.]{1}/g, '-').replace(/\-[0-9]+\-[0-9]+\-[0-9]+Z$/, '')
    this.sessionDir = path.resolve(`./brains/${this.session}`)
    if (!fs.existsSync(this.sessionDir)) fs.mkdirSync(this.sessionDir)

    this.seight = CONSTANTS.PLANET_MAX_RADIUS
    this.brain = brain

    this.type = type

    this.lastX = 0
    this.lastY = 0

    if (context) this.setFirstContext(context)

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
    this.brain.onE(epsilon)
  }

  update (data) {
    if (data) this.context.fromRemote(data)
    this.context.update()
    if (!this.me || !this.me.id) return true
    if (!this.context.exists(this.me.id)) return false
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

    const context = new Context(data, null, null, CONSTANTS, Element, Bounds)
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
    const distReward = Maths.distance(this.x, this.y, this.lastX, this.lastY) > 1 ? 1 : 0
    const lifeReward = (!this.lastLife || this.lastLife === life) ? 0 : 1 // this.lastLife - life
    const scoreReward = (score < 1 || this.lastScore > score) ? 0 : 1 // (score - this.lastScore)
    this.reward = scoreReward - lifeReward + distReward
    if ((this.oldMe && me.id !== this.oldMe) || this.lastLife < life) {
      this.reward = -1
    }
    const or = this.reward * 1
    this.reward = Maths.norm(this.reward, -1, 3) * 2 - 1
    if (this.reward < -1 || this.reward > 1) {
      console.log('----------------------------------')
      console.log('----------------------------------')
      console.log('----------------------------------')
      console.log('----------------------------------')
      console.log('WRONG REWARD', this.reward, or)
      console.log('----------------------------------')
      console.log('----------------------------------')
      console.log('----------------------------------')
      console.log('----------------------------------')
    }
    this.oldMe = me.id
    this.lastScore = score * 1.00
    this.lastLife = life * 1
    this.lastX = x * 1.0
    this.lastY = y * 1.0
  }

  think () {
    const result = this.context.sense(this.me.id, this.x, this.y, this.rotation)
    this.obstacles = result
    const vision = result.v.reduce((a, b) => a.concat(b))
    
    const inputs = vision
    if (this.label && this.brain.learn()) {
      this.brain.backward(this.reward)
      this.reward = 0.0
    }
    this.label = this.brain.forward(inputs)

    inputs.forEach((ii, idx) => {
      if (ii < 0 || ii > 1 || isNaN(ii)) console.error('INPUT !!!', ii, idx)
    })

    return this.label
  }

  console(d, name, nc) {
    console.log('TIME TO Think', this.type, name, d, 'ms', nc, this.label)
    this.brain.console()
  }
}

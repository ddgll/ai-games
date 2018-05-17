'use strict';

const GameContext = require('./game-context')
const Ship = require('./elements/ship')
const Bullet = require('./elements/bullet')
const Planet = require('./elements/planet')
const Asteroid = require('./elements/asteroid')
const Maths = require('./maths')
const CONSTANTS = require('../statics/js/constants')
const fs = require('fs')
const path = require('path')

module.exports = class GameContext {
  constructor (options, io) {
    this.counter = 0
    this.aids = 1
    this.sids = 1
    this.bids = 1
    this.nbFlushHistory = options && options.nbFlushHistory ? options.nbFlushHistory : Math.round(500 / 30)
    this.width = options && options.width ? options.width : CONSTANTS.WIDTH
    this.height = options && options.height ? options.height : CONSTANTS.HEIGHT
    this.xCenter = this.width / 2
    this.yCenter = this.height / 2
    this.ships = []
    this.bullets = []
    this.planets = []
    this.bonuses = []
    this.first = null
    this.bestScore = null
    this.snapshot = null
    this.gameover = null
    this.io = io
    this.best = 0
    this.asteroids = []
    const d = new Date()
    this.start = d.getTime()
    this.history = []
    this.createPlanets()
    this.createAsteroids()
    console.log('Start game width', this.nbFlushHistory, ' memory')
  }

  setGameOver(func) {
    this.gameover = func
  }

  flush () {
    const d = new Date()
    this.start = d.getTime()
    this.counter = 0
    this.history = []
    this.planets.forEach(p => {
      p.owner = null
      p.challenge = 0
      p.challenger = null
    })
    this.sids = 1
  }

  update () {
    const ctx = this.getContext()
    if (this.snapshot) {
      const diffs = this.getShipsDiff(ctx, this.snapshot)
      const bdiffs = this.getBulletsDiff(ctx, this.snapshot, diffs)
      const asteroids = ctx.a
      for (let i = 0, l = asteroids.length, b; i < l; i++) {
        b = asteroids[i]
        diffs.push(`a|${b.id}|${b.x}|${b.y}|${b.e}`)
      }
      const planets = ctx.p
      const sPlanets = this.snapshot.p
      for (let i = 0, l = planets.length, p, sP; i < l; i++) {
        p = planets[i]
        sP = sPlanets[i]
        if (p.o !== sP.o || p.c !== sP.c || p.cl !== sP.cl) diffs.push(`p|${p.id}|${p.o}|${p.c}|${p.cl}}`)
      }
      this.history.push({ id: ctx.id, t: ctx.t, d: diffs })
      const length = this.history.length
      if (length > this.nbFlushHistory) {
        this.history = this.history.slice(length - this.nbFlushHistory)
      }
    }
    this.snapshot = ctx
    this.counter++
    let max = 0
    for (let i = 0, l = this.planets.length; i < l; i++) this.planets[i].update(this.planets, this.ships, this.asteroids)
    for (let i = 0, l = this.ships.length, s; i < l; i++) {
      s = this.ships[i]
      s.update(this.planets, this.ships, this.asteroids, this.bonuses, ctx.b)
      if (s.brain && s.score > this.bestScore) {
        if (s.score > this.bestScore + 100) {
          this.first = s
          const d = new Date()
          const binary = s.brain.export()
          const name = `./brains/brain-${d.getTime()}-${Math.round(this.bestScore)}.bin`
          const bestname = `./best-brain.bin`
          const blob = new DataView(binary).buffer
          fs.writeFile(path.resolve(name), new Buffer(blob), () => {})
          fs.writeFile(path.resolve(bestname), new Buffer(blob), () => {})
          console.log('SAVE New best score', s.score)
        }
        this.bestScore = s.score
      }
    }
    for (let i = 0, l = this.asteroids.length; i < l; i++) this.asteroids[i].update(this.ships)
    this.ships = this.ships.filter(s => s.life > 0 || s.brain)
    if (this.ships.filter(s => s.brain !== null).length === 0 && typeof this.gameover === 'function') this.gameover(this.counter)
  }

  getShipsDiff (ctx, snapshot) {
    const diffs = []
    const sShips = snapshot.s
    const sIds = sShips.map(s => s.id)
    const ships = ctx.s
    const ids = ships.map(s => s.id)
    for (let i = 0, l = ships.length, s; i < l; i++) {
      s = ships[i]
      const idx = sIds.indexOf(s.id)
      if (idx < 0) {
        diffs.push(`s|a|${s.id}|${s.n}|${s.x}|${s.y}|${s.a}|${s.l}|${s.s}|${s.g}`)
      } else {
        const sS = sShips[idx]
        if (sS.x !== s.x || sS.y !== s.y || sS.a !== s.a || sS.l !== s.l || sS.g !== s.g)  diffs.push(`s|m|${s.id}|${s.x}|${s.y}|${s.a}|${s.l}|${s.s}|${s.g}`)
      }
    }
    for (let i = 0, l = sShips.length, sS; i < l; i++) {
      sS = sShips[i]
      const idx = ids.indexOf(sS.id)
      if (idx < 0) diffs.push(`s|d|${sS.id}`)
    }
    return diffs
  }

  getBulletsDiff (ctx, snapshot, diffs) {
    const sBullets = snapshot.b
    const sIds = sBullets.map(s => s.id)
    const bullets = ctx.b
    const ids = bullets.map(s => s.id)
    for (let i = 0, l = bullets.length, b; i < l; i++) {
      b = bullets[i]
      const idx = sIds.indexOf(b.id)
      if (idx < 0) {
        diffs.push(`b|a|${b.id}|${b.x}|${b.y}|${b.o}`)
      } else {
        const sB = sBullets[idx]
        if (sB.x !== b.x || sB.y !== b.y)  diffs.push(`b|m|${b.id}|${b.x}|${b.y}|${b.o}`)
      }
    }
    for (let i = 0, l = sBullets.length, sB; i < l; i++) {
      sB = sBullets[i]
      const idx = ids.indexOf(sB.id)
      if (idx < 0) diffs.push(`b|d|${sB.id}`)
    }
    return diffs
  }

  getAsteroidsDiff (ctx, snapshot) {
    const diffs = []
    
    return diffs
  }

  getContext () {
    const d = new Date()
    let bullets = []
    const ships = this.ships.map(s => {
      bullets = bullets.concat(s.bullets.filter(b => !b.dead()).map(b => {
        return { id: b.id, o: b.owner, x: b.x, y: b.y, vx: b.vel.x, vy: b.vel.y, a: b.rotation }
      }))
      return { id: s.id, n: s.name, x: s.x, y: s.y, a: s.rotation, s: s.score, d: s.distance, l: s.life, g: (s.god > 0) ? 1 : 0, o: s.obs, le: s.brain && s.brain.learning && s.brain.training ? 1 : 0, lo: isNaN(s.loss) ? 0 : s.loss, re: s.reward, g: s.god }
    })
    const planets = this.planets.map(p => {
      bullets = bullets.concat(p.bullets.filter(b => !b.dead()).map(b => {
        return { id: b.id, o: b.owner, x: b.x, y: b.y, vx: b.vel.x, vy: b.vel.y, t: b.target, a: b.rotation }
      }))
      return { id: p.id, x: p.x, y: p.y, r: p.radius, o: p.owner ? String(p.owner).replace(/[^0-9]/g, '') * 1 : 0, c: p.challenger ? String(p.challenger).replace(/[^0-9]/g, '') * 1 : 0, cl: p.challenge ? p.challenge : 0 }
    })
    const bonuses = this.bonuses.map(s => {
      return { id: s.id, x: s.x, y: s.y }
    })
    let e
    const asteroids = this.asteroids.map(s => {
      e = { id: s.id, x: s.x, y: s.y, v: s.vertexes, e: s.explode ? 1 : 0 }
      if (s.explode) s.reset()
      return e
    })
    const time = d.getTime() - this.start
    return { id: this.counter, t: time, s: ships, b: bullets, p: planets, bo: bonuses, a: asteroids }
  }

  addShip (name, brain) {
    const id = this.sids++
    let x, y
    if (CONSTANTS.SHIP_SEE_SHIP) {
      do{
        x = Maths.randomInt(0+CONSTANTS.PLANET_MAX_RADIUS, CONSTANTS.WIDTH-CONSTANTS.PLANET_MAX_RADIUS)
        y = Maths.randomInt(0+CONSTANTS.PLANET_MAX_RADIUS, CONSTANTS.HEIGHT-CONSTANTS.PLANET_MAX_RADIUS)
      } while(this.notToClose({ x, y }, CONSTANTS.PLANET_MAX_RADIUS))
    } else {
      x = 30
      y = 30
    }
    const ship = new Ship(id, x, y, name, { xCenter: this.xCenter, yCenter: this.yCenter }, brain)
    this.ships.push(ship)
    return ship
  }

  addAsteroid (x_, y_) {
    const id = this.aids++
    const x = Maths.randomInt(0 + 50, CONSTANTS.WIDTH - 50)
    const y = Maths.randomInt(0 + 50, CONSTANTS.HEIGHT - 50)
    const asteroid = new Asteroid(id, x_ || x, y_ || y, this.planets, { xCenter: this.xCenter, yCenter: this.yCenter })
    this.asteroids.push(asteroid)
    return asteroid
  }

  moveShip (id, x, y) {
    const index = this.ships.findIndex(s => s.id === id)
    if (index < 0) return null
    const ship = this.ships[index]
    // const fin = this.ships.slice(index + 1)
    ship.move(x, y)
    //this.ships = this.ships.slice(0, index)
    //this.ships.push(ship)
    //this.ships = this.ships.concat(fin)
  }

  removeShip (id) {
    this.ships = this.ships.filter(s => s.id !== id)
    this.planets = this.planets.map(p => {
      if (p.owner === id) p.owner = null
      if (p.challenger === id) {
        p.challenger = null
        p.challenge = 0
      }
      return p
    })
  }

  shoot (id) {
    const ship = this.ships.find(s => s.id === id)
    if (ship) ship.shoot()
  }

  getWindow () {
    return this.history
  }

  getLastWindow () {
    return this.history[this.history.length - 1]
  }

  createAsteroids () {
    for(let i = 1, asteroid; i <= CONSTANTS.NB_ASTEROID; i++){
      this.addAsteroid()
    }
  }

  createPlanets () {
    this.planets = [
      new Planet(
        1,
        CONSTANTS.WIDTH / 2,
        CONSTANTS.HEIGHT / 2,
        Maths.randomInt(CONSTANTS.PLANET_MIN_RADIUS, CONSTANTS.PLANET_MAX_RADIUS)
      )
    ]
    const minDistance = CONSTANTS.PLANET_MAX_RADIUS * 1.5
    for(let i = 2, planet; i <= CONSTANTS.NB_PLANETS; i++){
      do{
        planet = new Planet(
          this.planets.length + 1,
          Math.floor(Math.random() * this.width-minDistance) + minDistance,
          Math.floor(Math.random() * this.height-minDistance) + minDistance,
          Maths.randomInt(CONSTANTS.PLANET_MIN_RADIUS, CONSTANTS.PLANET_MAX_RADIUS)
        )
      }while(this.notToClose(planet, minDistance))
      this.planets.push(planet)
    }
  }

  notToClose (planet, min) {
    return this.isClose(planet, this.planets, min);
  };

  isClose (item, items, min, notSameId) {
    const boundMin = min
    for(let i = 0, l = items.length, p, d, d1, d2, d3, d4, d5; i < l; i++){
      p = items[i];
      if(!notSameId || item.id != p.id){
        d = Maths.distance(item.x, item.y, p.x, p.y);
        d1 = Maths.distance(item.x, item.y, item.x, CONSTANTS.HEIGHT);
        d2 = Maths.distance(item.x, item.y, item.x, 0);
        d3 = Maths.distance(item.x, item.y, 0, item.y);
        d4 = Maths.distance(item.x, item.y, CONSTANTS.WIDTH, item.y);
        if( d < min || 
            d1 < CONSTANTS.PLANET_MAX_RADIUS ||
            d2 < CONSTANTS.PLANET_MAX_RADIUS ||
            d3 < CONSTANTS.PLANET_MAX_RADIUS ||
            d4 < CONSTANTS.PLANET_MAX_RADIUS
          ) return true
      }
    }
    return false;
  };
}
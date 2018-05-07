const GameContext = require('./game-context')
const Ship = require('./elements/ship')
const Bullet = require('./elements/bullet')
const Planet = require('./elements/planet')
const Asteroid = require('./elements/asteroid')
const Maths = require('./maths')
const CONSTANTS = require('../statics/js/constants')

module.exports = class GameContext {
  constructor (options) {
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
    this.snapshot = null
    this.asteroids = []
    const d = new Date()
    this.start = d.getTime()
    this.history = []
    this.createPlanets()
    this.createAsteroids()
    console.log('Start game width', this.nbFlushHistory, ' memory')
  }

  update () {
    const ctx = this.getContext()
    if (this.snapshot) {
      const diffs = this.getShipsDiff(ctx, this.snapshot)
      const bdiffs = this.getBulletsDiff(ctx, this.snapshot, diffs)
      const asteroids = ctx.a
      for (let i = 0, l = asteroids.length, b; i < l; i++) {
        b = asteroids[i]
        diffs.push(`a|${b.id}|${b.x}|${b.y}}`)
      }
      const planets = ctx.p
      const sPlanets = this.snapshot.p
      for (let i = 0, l = planets.length, p, sP; i < l; i++) {
        p = planets[i]
        sP = sPlanets[i]
        if (p.o !== sP.o || p.c !== sP.c || p.cl !== sP.cl) diffs.push(`p|${p.id}|${p.o}|${p.c}|${p.cl}}`)
      }
      this.history.push({ id: ctx.id, t: ctx.t, d: diffs })
    }
    this.snapshot = ctx
    this.counter++
    this.planets.forEach(p => p.update(this.planets, this.ships, this.asteroids))
    this.ships.forEach(s => s.update(this.planets, this.ships, this.asteroids))
    this.asteroids.forEach(s => s.update(this.ships))
    // this.bullets.forEach(b => b.update())
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
        diffs.push(`s|a|${s.id}|${s.x}|${s.y}|${s.a}|${s.l}|${s.s}`)
      } else {
        const sS = sShips[idx]
        if (sS.x !== s.x || sS.y !== s.y || sS.a !== s.a)  diffs.push(`s|m|${s.id}|${s.x}|${s.y}|${s.a}|${s.l}|${s.s}`)
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
        return { id: b.id, o: b.owner, x: b.x, y: b.y, a: b.rotation }
      }))
      return { id: s.id, x: s.x, y: s.y, a: s.rotation, s: s.score, l: s.life }
    })
    const planets = this.planets.map(p => {
      bullets = bullets.concat(p.bullets.filter(b => !b.dead()).map(b => {
        return { id: b.id, o: b.owner, x: b.x, y: b.y, t: b.target }
      }))
      return { id: p.id, x: p.x, y: p.y, r: p.radius, o: p.owner, c: p.challenger, cl: p.challenge }
    })
    const bonuses = this.bonuses.map(s => {
      return { id: s.id, x: s.x, y: s.y }
    })
    const asteroids = this.asteroids.map(s => {
      return { id: s.id, x: s.x, y: s.y, v: s.vertexes }
    })
    const time = d.getTime() - this.start
    return { id: this.counter, t: time, s: ships, b: bullets, p: planets, bo: bonuses, a: asteroids }
  }

  addShip () {
    const id = this.sids++
    let x, y
    do{
      x = Maths.randomInt(0+CONSTANTS.PLANET_MAX_RADIUS, CONSTANTS.WIDTH-CONSTANTS.PLANET_MAX_RADIUS)
      y = Maths.randomInt(0+CONSTANTS.PLANET_MAX_RADIUS, CONSTANTS.HEIGHT-CONSTANTS.PLANET_MAX_RADIUS)
    } while(this.notToClose({ x, y }, CONSTANTS.PLANET_MAX_RADIUS))
    const ship = new Ship(id, x, y, { xCenter: this.xCenter, yCenter: this.yCenter })
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
    const fin = this.ships.slice(index + 1)
    ship.move(x, y)
    this.ships = this.ships.slice(0, index)
    this.ships.push(ship)
    this.ships = this.ships.concat(fin)
  }

  removeShip (id) {
    this.ships = this.ships.filter(s => s.id !== id)
  }

  shoot (id) {
    const ship = this.ships.find(s => s.id === id)
    if (ship) ship.shoot()
  }

  getWindow () {
    const length = this.history.length
    if (length > this.nbFlushHistory) {
      this.history = this.history.slice(length - this.nbFlushHistory)
    }
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
    const minDistance = CONSTANTS.PLANET_MAX_RADIUS * 2
    for(let i = 1, planet; i <= CONSTANTS.NB_PLANETS; i++){
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
    for(let i = 0, l = items.length, p, d, d1, d2, d3, d4; i < l; i++){
      p = items[i];
      if(!notSameId || item.id != p.id){
        d = Maths.distance(item.x, item.y, p.x, p.y);
        d1 = Maths.distance(item.x, item.y, item.x, CONSTANTS.HEIGHT);
        d2 = Maths.distance(item.x, item.y, item.x, 0);
        d3 = Maths.distance(item.x, item.y, 0, item.y);
        d4 = Maths.distance(item.x, item.y, CONSTANTS.WIDTH, item.y);
        if(d < min || d1 < CONSTANTS.PLANET_MAX_RADIUS || d2 < CONSTANTS.PLANET_MAX_RADIUS || d3 < CONSTANTS.PLANET_MAX_RADIUS || d4 < CONSTANTS.PLANET_MAX_RADIUS) return true
      }
    }
    return false;
  };
}
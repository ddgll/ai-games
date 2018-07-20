class CoreContext {
  constructor (data, p, log, constants, element, boundsClass) {
    this.renderer = p
    this.buffer = []
    this.ships = {}
    this.bullets = {}
    this.planets = {}
    this.asteroids = {}
    this.log = log
    this.explosions = []
    this.id = data.context.id
    this.last = data.context.t
    this.start = this.last * 1
    this.bounds = null
    this.constants = constants
    this.element = element
    this.boundsClass = boundsClass
  }

  exists (id) {
    return typeof this.ships[id] !== 'undefined' || typeof this.ships['' + id] !== 'undefined' || typeof this.ships[+id] !== 'undefined'
  }

  setBounds (x, y) {
    this.bounds = {
      xMin: 0-x-this.constants.PLANET_MAX_RADIUS+2,
      yMin: 0-y-this.constants.PLANET_MAX_RADIUS+2,
      xMax: this.constants.CANVAS_WIDTH-x-2+this.constants.PLANET_MAX_RADIUS,
      yMax: this.constants.CANVAS_HEIGHT-y-2+this.constants.PLANET_MAX_RADIUS
    }
  }

  debug (msg, flush) {
    if (this.log) {
      const str = `- ${msg} <br>`
      if (flush) {
        this.log.innerHTML = str
      } else {
        this.log.innerHTML = str + this.log.innerHTML
      }
    }
  }

  fromRemote (ctx) {
    if (!ctx || !ctx.filter) return
    const last = this.last
    const ctxs = ctx.filter(c => c.t > last)
    if (!ctxs || !ctxs.length) return
    this.buffer = this.buffer.concat(ctxs)
    this.last = ctx[ctx.length - 1].t
    if (this.last - this.start > this.constants.LATENCY) return true
    return false
  }

  onScreen (x, y) {
    if (!this.bounds) return false
    // console.log(x, y, JSON.stringify(this.bounds), true)
    if (x < this.bounds.xMin || x > this.bounds.xMax) return false
    if (y < this.bounds.yMin || y > this.bounds.yMax) return false
    return true
  }

  update (frameDiv) {
    if (this.renderer) {
      for (let i = 0, l = this.explosions.length, s; i < l; i++) {
        this.explosions[i].update()
      }
      this.explosions = this.explosions.filter(e => e.particles.length > 0)
    }
    if (frameDiv) frameDiv.innerHTML = `<h1>Frame: ${this.last}, id: ${this.id}, buffer: ${this.buffer.length}</h1>`
    if (this.buffer && this.buffer.length) {
      const d = new Date()
      const time = d.getTime()
      const diff = this.start - time
      if (this.buffer.length > this.constants.MAX_BUFFER_LENGTH) {
        this.buffer = this.buffer.slice(this.buffer.length - this.constants.MAX_BUFFER_LENGTH)
      }
      const changes = this.buffer.shift()
      if (this.id < changes.id && changes.d && changes.d.length) {
        this.id = changes.id
        const sids = Object.values(this.ships).map(s => s.id)
        const bids = Object.values(this.bullets).map(b => b.id)
        const csids = []
        const cbids = []
        let idx
        // this.debug('<pre>' + JSON.stringify(changes, null, 2) + '</pre>', true)
        changes.d.forEach(diff => {
          const data = String(diff).split('|')
          if (data && data.length >= 2) {
            const object = data[0]
            switch (object) {
              case 's':
                csids.push(this.updateShip(data, sids))
                break;
              case 'b':
                cbids.push(this.updateBullet(data, bids))
                break;
              case 'a':
                this.updateAsteroid(data)
                break;
              case 'p':
                this.updatePlanet(data)
                break;
            }
          } else {
            this.debug('WRONG Data' + JSON.stringify(data))
          }
        })
        sids.forEach(id => {
          idx = csids.indexOf(id)
          if (idx < 0) {
            // console.log('REMOVE SHIP', id)
            delete this.ships[id]
          }
        })
        bids.forEach(id => {
          idx = cbids.indexOf(id)
          if (idx < 0) {
            // console.log('REMOVE BULLET', id)
            delete this.bullets[id]
          }
        })
      }
    }
    return Object.values(this.ships).map(s => +s.id)
  }
  
  updateShip (data) {
    const type = data[1]
    const id = data[2]
    this.debug('Update ship! <pre>' + JSON.stringify(data, null, true) + '</pre>', true)
    switch (type) {
      case 'a': {
        if (data.length === 14) {
          const n = data[3]
          const x = data[4]
          const y = data[5]
          const a = data[6]
          const l = data[7]
          const s = data[8]
          const g = data[9]
          const vx = data[10]
          const vy = data[11]
          const tx = data[10]
          const ty = data[11]
          if (typeof this.ships[id] === 'undefined') {
            if (!this.element) {
              this.ships[id] = new Ship(id, n, { x, y, a, s, l, g, vx, vy, tx, ty }, this.renderer, this.log)
            } else {
              this.ships[id] = new this.element(id, { x, y, a, s, l, g, vx, vy, tx, ty }, this.renderer, this.log)
            }
          }
        }
      }
      case 'm': {
        if (data.length === 13) {
          const x = data[3]
          const y = data[4]
          const a = data[5]
          const l = data[6]
          const s = data[7]
          const g = data[8]
          const vx = data[9]
          const vy = data[10]
          const tx = data[11]
          const ty = data[12]
          if (typeof this.ships[id] !== 'undefined') {
            // console.log('UPDATE SHIP', x, y)
            this.ships[id].update({ x, y, a, s, l, g, vx, vy, tx, ty })
          } else {
            if (!this.element) {
              this.ships[id] = new Ship(id, 'John Doe', { x, y, a, s, l, g, vx, vy, tx, ty }, this.renderer, this.log)
            } else {
              this.ships[id] = new this.element(id, { x, y, a, s, l, g, vx, vy, tx, ty }, this.renderer, this.log)
            }
          }
        }
      }
    }
    return id
  }
  
  updateBullet (data) {
    const type = data[1]
    const id = data[2]
    // this.debug('Update bullet! <pre>' + JSON.stringify(data, null, true) + '</pre>', true)
    switch (type) {
      case 'a': {
        if (data.length === 6) {
          const x = data[3]
          const y = data[4]
          const o = data[5]
          if (typeof this.bullets[id] === 'undefined') {
            if (!this.element) {
              this.bullets[id] = new Bullet(id, { x, y, o }, this.renderer, this.log)
            } else {
              this.bullets[id] = new this.element(id, { x, y, o }, this.renderer, this.log)
            }
          }
        }
      }
      case 'm': {
        if (data.length === 6) {
          const x = data[3]
          const y = data[4]
          const o = data[5]
          if (typeof this.bullets[id] !== 'undefined') {
            this.bullets[id].update({ x, y, o })
            // this.debug('Update ship ' + id, true)
          } else {
            if (!this.element) {
              this.bullets[id] = new Bullet(id, { x, y, o }, this.renderer, this.log)
            } else {
              this.bullets[id] = new this.element(id, { x, y, o }, this.renderer, this.log)
            }
          }
        }
      }
    }
    return id
  }
  
  updateAsteroid (data) {
    const id = data[1]
    // this.debug('Update asteroid! <pre>' + JSON.stringify(data, null, true) + '</pre>', true)
    if (data.length === 5) {
      const x = data[2]
      const y = data[3]
      const e = data[4]
      if (typeof this.asteroids[id] !== 'undefined') {
        this.asteroids[id].update({ x, y, e })
      }
    }
  }
  
  updatePlanet (data) {
    const id = data[1]
    // this.debug('Update planet! <pre>' + JSON.stringify(data, null, true) + '</pre>', true)
    if (data.length === 5) {
      const o = data[2]
      const c = data[3]
      const cl = data[4]
      if (typeof this.planets[id] !== 'undefined') {
        this.planets[id].update({ o, c, cl })
      }
    }
  }

  sense (shipId, shipX, shipY, shipRotation) {
    const ships = Object.values(this.ships)
    const planets = Object.values(this.planets)
    const bullets = Object.values(this.bullets)
    const asteroids = Object.values(this.asteroids)
    const bonuses = []

    const obs = []
    const bounds = new this.boundsClass(this.constants)
    let x, y, r, v, ow, vp
    planets.forEach(p => {
      x = parseFloat(p.context.x)
      y = parseFloat(p.context.y) 
      r = parseFloat(p.context.r)
      v = this.getShipCoordinates(shipX, shipY, x, y, shipRotation)
      vp = v
      // if (bounds.circleCollide(v.x, v.y, r))
      obs.push({ type: 'p', p: this.getNormType('p'), x: v.x, y: v.y, r })
    })
    ships.forEach(s => {
      if (+s.id === +shipId) return
      x = parseFloat(s.context.x)
      y = parseFloat(s.context.y)
      v = this.getShipCoordinates(shipX, shipY, x, y, shipRotation)
      obs.push({ type: 's', p: this.getNormType('s'), x: v.x, y: v.y, r: this.constants.SHIP_SIZE })
    })
    asteroids.forEach(a => {
      x = parseFloat(a.context.x)
      y = parseFloat(a.context.y)
      v = this.getShipCoordinates(shipX, shipY, x, y, shipRotation)
      obs.push({ type: 'a', p: this.getNormType('a'), x: v.x, y: v.y, r: this.constants.ASTEROID_RADIUS })
    })
    bonuses.forEach(b => {
      x = parseFloat(b.context.x)
      y = parseFloat(b.context.y)
      v = this.getShipCoordinates(shipX, shipY, x, y, shipRotation)
      obs.push({ type: 'bo', p: this.getNormType('bo'), x: v.x, y: v.y, r: this.constants.BONUSES_RADIUS })
    })
    const reg = /^s[0-9]+$/
    const regrep = /[^0-9]/g
    bullets.forEach(b => {
      ow = b.context.o
      if (reg.test(ow) && +ow.replace(regrep, '') === +shipId) return
      x = parseFloat(b.context.x)
      y = parseFloat(b.context.y)
      v = this.getShipCoordinates(shipX, shipY, x, y, shipRotation)
      obs.push({ type: 'b', p: this.getNormType('b', reg.test(ow)), x: v.x, y: v.y, r: this.constants.BULLET_RADIUS })
    })
    let p1 = this.getShipCoordinates(shipX, shipY, 0, 0, shipRotation)
    let p2 = this.getShipCoordinates(shipX, shipY, this.constants.WIDTH, 0, shipRotation)
    let p3 = this.getShipCoordinates(shipX, shipY, 0, this.constants.HEIGHT, shipRotation)
    let p4 = this.getShipCoordinates(shipX, shipY, this.constants.WIDTH, this.constants.HEIGHT, shipRotation)
    obs.push({
      type: 'w',
      p: this.getNormType('w'),
      vertices: [ p1, p2, p4, p3 ]
    })
    
    const vision = bounds.getVision(obs)
    
    return { o: obs, v: vision }
  }

  getShipCoordinates (shipX, shipY, x, y, angle) {
    const a = angle + (Math.PI / 2)
    const xp = (Math.cos(a) * (x - shipX)) + (Math.sin(a) * (y - shipY))
    const yp = (-Math.sin(a) * (x - shipX)) + (Math.cos(a) * (y - shipY))
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
}

if (typeof window === 'undefined') module.exports = CoreContext

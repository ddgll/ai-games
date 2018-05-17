class CoreContext {
  constructor (data, p, log, constants, element) {
    this.renderer = p
    this.buffer = []
    this.ships = {}
    this.bullets = {}
    this.planets = {}
    this.asteroids = {}
    this.log = log
    this.me = data.ship
    this.explosions = []
    this.id = data.context.id
    this.last = data.context.t
    this.start = this.last * 1
    this.bounds = null
    this.constants = constants
    this.element = element
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
    if (!ctx) return
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
        // this.debug('<pre>' + JSON.stringify(changes, null, 2) + '</pre>', true)
        changes.d.forEach(diff => {
          const data = String(diff).split('|')
          if (data && data.length >= 2) {
            const object = data[0]
            switch (object) {
              case 's':
                this.updateShip(data)
                break;
              case 'b':
                this.updateBullet(data)
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
      }
    }
    if (this.me && this.me.id && typeof this.ships[this.me.id] !== 'undefined') this.me = this.ships[this.me.id]
  }
  
  updateShip (data) {
    const type = data[1]
    const id = data[2]
    const meid = this.me && this.me.id ? this.me.id : null
    this.debug('Update ship! <pre>' + JSON.stringify(data, null, true) + '</pre>', true)
    switch (type) {
      case 'a': {
        if (data.length === 10) {
          const n = data[3]
          const x = data[4]
          const y = data[5]
          const a = data[6]
          const l = data[7]
          const s = data[8]
          const g = data[9]
          if (typeof this.ships[id] === 'undefined') {
            if (!this.element) {
              this.ships[id] = new Ship(id, n, { x, y, a, s, l, g }, this.renderer, this.log, meid)
            } else {
              this.ships[id] = new this.element(id, { x, y, a, s, l, g }, this.renderer, this.log, meid)
            }
            this.debug('Add ship ' + id)
          }
        }
      }
      case 'm': {
        if (data.length === 9) {
          const x = data[3]
          const y = data[4]
          const a = data[5]
          const l = data[6]
          const s = data[7]
          const g = data[8]
          if (typeof this.ships[id] !== 'undefined') {
            this.ships[id].update({ x, y, a, s, l, g })
            // this.debug('Update ship ' + id, true)
          } else {
            if (!this.element) {
              this.ships[id] = new Ship(id, 'John Doe', { x, y, a, s, l, g }, this.renderer, this.log, meid)
            } else {
              this.ships[id] = new this.element(id, { x, y, a, s, l, g }, this.renderer, this.log, meid)
            }
            this.debug('Add ship ' + id)
          }
        }
      }
      case 'd': {
        if (data.length === 3 && typeof this.ships[id] !== 'undefined') {
          if (this.renderer) {
            this.explosions.push(new Explosion(parseFloat(this.ships[id].context.x), parseFloat(this.ships[id].context.y), this.renderer))
          }
          delete this.ships[id]
          this.debug('Delete ship ' + id)
        }
      }
    }
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
              this.bullets[id] = new Bullet(id, { x, y, o }, this.renderer, this.log, this.me)
            } else {
              this.bullets[id] = new this.element(id, { x, y, o }, this.renderer, this.log, this.me)
            }
            this.debug('Add bullet ' + id)
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
              this.bullets[id] = new Bullet(id, { x, y, o }, this.renderer, this.log, this.me)
            } else {
              this.bullets[id] = new this.element(id, { x, y, o }, this.renderer, this.log, this.me)
            }
            this.debug('Add ship ' + id)
          }
        }
      }
      case 'd': {
        if (data.length === 3 && typeof this.bullets[id] !== 'undefined') {
          delete this.bullets[id]
          this.debug('Delete bullet ' + id)
        }
      }
    }
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
}

if (typeof window === 'undefined') module.exports = CoreContext

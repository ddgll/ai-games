class Context {
  constructor (data, p, log) {
    console.log('FIRST Context', data)
    this.renderer = p
    this.buffer = []
    this.ships = {}
    this.bullets = {}
    this.planets = {}
    this.asteroids = {}
    this.log = log
    this.me = data.ship
    for (let i = 0, l = data.context.s.length, s; i < l; i++) {
      s = data.context.s[i]
      this.ships[s.id] = new Ship(s.id, { x: s.x, y: s.y, a: s.a, l: s.l, s: s.s }, this.renderer, log)
    }
    for (let i = 0, l = data.context.p.length, p; i < l; i++) {
      p = data.context.p[i]
      this.planets[p.id] = new Planet(p.id, { x: p.x, y: p.y, r: p.r}, this.renderer, log)
    }
    for (let i = 0, l = data.context.a.length, a; i < l; i++) {
      a = data.context.a[i]
      this.asteroids[a.id] = new Asteroid(a.id, { x: a.x, y: a.y, v: a.v}, this.renderer, log)
    }
    this.id = data.context.id
    this.last = data.context.t
    this.start = this.last * 1
    this.bounds = null
  }

  setBounds (x, y) {
    this.bounds = { xMin: 0-x-CONSTANTS.PLANET_MAX_RADIUS+2, yMin: 0-y-CONSTANTS.PLANET_MAX_RADIUS+2, xMax: CONSTANTS.CANVAS_WIDTH-x-2+CONSTANTS.PLANET_MAX_RADIUS, yMax: CONSTANTS.CANVAS_HEIGHT-y-2+CONSTANTS.PLANET_MAX_RADIUS}
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
    if (this.last - this.start > CONSTANTS.LATENCY) return true
    return false
  }

  onScreen (x, y) {
    if (!this.bounds) return false
    // console.log(x, y, JSON.stringify(this.bounds), true)
    if (x < this.bounds.xMin || x > this.bounds.xMax) return false
    if (y < this.bounds.yMin || y > this.bounds.yMax) return false
    return true
  }

  draw (frameDiv, bgDiv) {
    const me = this.me
    let s
    for (let id in this.ships) {
      s = this.ships[id]
      if (me.id === s.id) {
        me.x = s.context.x
        me.y = s.context.y
        me.s = s.context.s
        me.l = s.context.l
        break;
      }
    }
    if (frameDiv) {
      frameDiv.innerHTML = `<h1>Frame: ${this.last}, id: ${this.id}, buffer: ${this.buffer.length}</h1>`
      if (me) {
        frameDiv.innerHTML += `<h2>(${me.x}, ${me.y})</h2>`
      }
    }
    if (me) {
      let x = (CONSTANTS.CANVAS_WIDTH / 2)-me.x
      let y = (CONSTANTS.CANVAS_HEIGHT / 2)-me.y
      this.setBounds(x, y)
      this.renderer.text(`Score: ${me.s}`, 10, 20)
      this.renderer.text(`Vie: ${me.l}%`, 10, 40)
      const leader = []
      let sh
      for (let i in this.ships) {
        sh = this.ships[i]
        leader.push({ id: s.id, score: s.context.s })
      }
      leader.sort((a, b) => b.score - a.score)
      for (let i = 0, l = leader.length > 5 ? 5 : leader.length; i < l; i++) {
        this.renderer.text(`${i+1} - ${leader[i].id}: ${leader[i].score}`, CONSTANTS.CANVAS_WIDTH - 100, 20*(i+1))
      }
      this.renderer.translate(x, y)
    }
    this.renderer.stroke(255, 255, 255, 150)
    this.renderer.strokeWeight(1)
    this.renderer.noFill()
    this.renderer.rect(0, 0, CONSTANTS.WIDTH, CONSTANTS.HEIGHT)
    this.renderer.rect(this.bounds.xMin, this.bounds.yMin, this.bounds.xMax - this.bounds.xMin, this.bounds.yMax - this.bounds.yMin)
    this.renderer.noStroke()
    for (let id in this.ships) {
      s = this.ships[id]
      if (this.onScreen(s.context.x, s.context.y)) s.draw(me)
    }
    for (let id in this.bullets) {
      s = this.bullets[id]
      if (this.onScreen(s.context.x, s.context.y)) s.draw(me, this.ships)
    }
    for (let id in this.planets) {
      s = this.planets[id]
      if (this.onScreen(s.context.x, s.context.y)) s.draw(me)
    }
    for (let id in this.asteroids) {
      s = this.asteroids[id]
      if (this.onScreen(s.context.x, s.context.y)) s.draw(me)
    }
  }

  update (frameDiv) {
    if (frameDiv) frameDiv.innerHTML = `<h1>Frame: ${this.last}, id: ${this.id}, buffer: ${this.buffer.length}</h1>`
    if (this.buffer && this.buffer.length) {
      const d = new Date()
      const time = d.getTime()
      const diff = this.start - time
      if (this.buffer.length > CONSTANTS.MAX_BUFFER_LENGTH) {
        this.buffer = this.buffer.slice(this.buffer.length - CONSTANTS.MAX_BUFFER_LENGTH)
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
    if (typeof this.ships[this.me.id] !== 'undefined') this.me = this.ships[this.me.id]
  }
  
  updateShip (data) {
    const type = data[1]
    const id = data[2]
    // this.debug('Update ship! <pre>' + JSON.stringify(data, null, true) + '</pre>', true)
    switch (type) {
      case 'a': {
        if (data.length === 8) {
          const x = data[3]
          const y = data[4]
          const a = data[5]
          const l = data[6]
          const s = data[7]
          if (typeof this.ships[id] === 'undefined') {
            this.ships[id] = new Ship(id, { x, y, a, s, l }, this.renderer, this.log, this.me.id)
            this.debug('Add ship ' + id)
          }
        }
      }
      case 'm': {
        if (data.length === 8) {
          const x = data[3]
          const y = data[4]
          const a = data[5]
          const l = data[6]
          const s = data[7]
          if (typeof this.ships[id] !== 'undefined') {
            this.ships[id].update({ x, y, a, s, l })
            // this.debug('Update ship ' + id, true)
          } else {
            this.ships[id] = new Ship(id, { x, y, a, s, l }, this.renderer, this.log, this.me.id)
            this.debug('Add ship ' + id)
          }
        }
      }
      case 'd': {
        if (data.length === 3 && typeof this.ships[id] !== 'undefined') {
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
            this.bullets[id] = new Bullet(id, { x, y, o }, this.renderer, this.log, this.me)
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
            this.bullets[id] = new Bullet(id, { x, y, o }, this.renderer, this.log, this.me)
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
    if (data.length === 4) {
      const x = data[2]
      const y = data[3]
      if (typeof this.asteroids[id] !== 'undefined') {
        this.asteroids[id].update({ x, y })
      }
    }
  }
  
  updatePlanet (data) {
    const id = data[1]
    this.debug('Update planet! <pre>' + JSON.stringify(data, null, true) + '</pre>', true)
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
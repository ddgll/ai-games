class Context {
  constructor (data, p, log) {
    console.log('FIRST Context', data)
    this.renderer = p
    this.buffer = []
    this.ships = []
    this.sindexes = []
    this.bullets = []
    this.bindexes = []
    this.log = log
    this.me = data.ship
    data.context.s.forEach(s => {
      this.sindexes[s.id] = this.ships.length
      this.ships.push(new Ship(s.id, { x: s.x, y: s.y, a: s.a}, this.renderer, log, this.me.id))
    })
    this.id = data.context.id
    this.last = data.context.t
    this.start = this.last * 1
  }

  debug (msg, flush) {
    if (this.log) {
      const str = `- ${msg} <br>`
      if (flush) {
        this.log.innerHTML = msg
      } else {
        this.log.innerHTML = msg + this.log.innerHTML
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
    if (this.buffer.length > 100) {
      this.buffer = this.buffer.slice(this.buffer.length - 3)
    }
    if (this.last - this.start > CONSTANTS.LATENCY) return true
    return false
  }

  update (frameDiv) {
    if (frameDiv) frameDiv.innerHTML = `<h1>Frame: ${this.last}, id: ${this.id}, buffer: ${this.buffer.length}</h1>`
    if (this.buffer && this.buffer.length) {
      const d = new Date()
      const time = d.getTime()
      const diff = this.start - time
      const changes = this.buffer.shift()
      if (this.id < changes.id && changes.d && changes.d.length) {
        this.id = changes.id
        this.debug('<pre>' + JSON.stringify(changes, null, 2) + '</pre>', true)
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
            }
          } else {
            this.debug('WRONG Data' + JSON.stringify(data))
          }
        })
      }
    }
  }
  
  updateShip (data) {
    const type = data[1]
    const id = data[2]
    // this.debug('Update ship! <pre>' + JSON.stringify(data, null, true) + '</pre>', true)
    switch (type) {
      case 'a': {
        if (data.length === 6) {
          const x = data[3]
          const y = data[4]
          const a = data[5]
          if (typeof this.sindexes[id] === 'undefined') {
            this.sindexes[id] = this.ships.length
            this.ships.push(new Ship(id, { x, y, a }, this.renderer, this.log, this.me.id))
            this.debug('Add ship ' + id)
          }
        }
      }
      case 'm': {
        if (data.length === 6) {
          const x = data[3]
          const y = data[4]
          const a = data[5]
          if (typeof this.sindexes[id] !== 'undefined') {
            this.ships[this.sindexes[id]].update({ x, y, a })
            // this.debug('Update ship ' + id, true)
          } else {
            this.sindexes[id] = this.ships.length
            this.ships.push(new Ship(id, { x, y, a }, this.renderer, this.log, this.me.id))
            this.debug('Add ship ' + id)
          }
        }
      }
      case 'd': {
        if (data.length === 3 && typeof this.sindexes[id] !== 'undefined') {
          this.ships = this.ships.filter(s => s.id !== id)
          delete this.sindexes[id]
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
        if (data.length === 7) {
          const x = data[3]
          const y = data[4]
          const a = data[5]
          const o = data[6]
          if (typeof this.bindexes[id] === 'undefined') {
            this.bindexes[id] = this.bullets.length
            this.bullets.push(new Bullet(id, { x, y, a }, this.renderer, this.log, this.me.id === o))
            this.debug('Add bullet ' + id)
          }
        }
      }
      case 'm': {
        if (data.length === 5) {
          const x = data[3]
          const y = data[4]
          const a = data[5]
          if (typeof this.bindexes[id] !== 'undefined') {
            this.bullets[this.bindexes[id]].update({ x, y, a })
            // this.debug('Update bullet ' + id + '((' + JSON.stringify(this.bullets[this.bindexes[id]].context) + '))', true)
          } else {
            this.bindexes[id] = this.bullets.length
            this.bullets.push(new Bullet(id, { x, y, a }, this.renderer, this.log, this.me.id))
            this.debug('Add bullet ' + id)
          }
        }
      }
      case 'd': {
        if (data.length === 3 && typeof this.bindexes[id] !== 'undefined') {
          const bullet = this.bullets.find(s => s.id === id)
          if (bullet) bullet.kill()
          this.bullets = this.bullets.filter(s => s.id !== id)
          delete this.bindexes[id]
          this.debug('Delete bullet ' + id)
        }
      }
    }
  }
}
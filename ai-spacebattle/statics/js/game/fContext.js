class Context extends CoreContext {
  constructor (data, p, log) {
    super(data, p, log, CONSTANTS, null, Bounds)
    this.me = data.ship
    for (let i = 0, l = data.context.s.length, s; i < l; i++) {
      s = data.context.s[i]
      this.ships[s.id] = new Ship(s.id, s.n, { x: s.x, y: s.y, vx: s.vx, vy: s.vy, a: s.a, l: s.l, s: s.s, d: s.d, o: s.o, g: s.g }, this.renderer, log)
    }
    for (let i = 0, l = data.context.p.length, p; i < l; i++) {
      p = data.context.p[i]
      this.planets[p.id] = new Planet(p.id, { x: p.x, y: p.y, r: p.r, o: p.o, c: p.c, cl: p.cl}, this.renderer, log)
    }
    for (let i = 0, l = data.context.a.length, a; i < l; i++) {
      a = data.context.a[i]
      this.asteroids[a.id] = new Asteroid(a.id, { x: a.x, y: a.y, v: a.v}, this.renderer, log)
    }
    for (let i = 0, l = data.context.b.length, b; i < l; i++) {
      b = data.context.b[i]
      this.bullets[b.id] = new Bullet(b.id, { x: b.x, y: b.y, o: b.o }, this.renderer, this.log)
    }
  }

  draw (observators) {
    let me = this.me
    let s
    if (me) {
      for (let id in this.ships) {
        s = this.ships[+id]
        if (+me.id === +s.id) {
          me.x = s.context.x
          me.y = s.context.y
          me.s = s.context.s
          me.l = s.context.l
          break;
        } else {
          console.log('ME NOT FOUND !!')
        }
      }
    }
    this.renderer.push()
    if (me) {
      let x = (CONSTANTS.CANVAS_WIDTH / 2)-me.x
      let y = (CONSTANTS.CANVAS_HEIGHT / 2)-me.y
      if (x > 0) x = 0
      if (x < -(CONSTANTS.WIDTH - CONSTANTS.CANVAS_WIDTH)) x = -(CONSTANTS.WIDTH - CONSTANTS.CANVAS_WIDTH)
      if (y > 0) y = 0
      if (y < -(CONSTANTS.HEIGHT - CONSTANTS.CANVAS_HEIGHT)) y = -(CONSTANTS.HEIGHT - CONSTANTS.CANVAS_HEIGHT)
      this.setBounds(x, y)
      this.renderer.translate(x, y)
    }
    this.renderer.stroke(255, 255, 255, 150)
    this.renderer.strokeWeight(1)
    this.renderer.noFill()
    this.renderer.rect(0, 0, CONSTANTS.WIDTH, CONSTANTS.HEIGHT)
    this.renderer.rect(this.bounds.xMin, this.bounds.yMin, this.bounds.xMax - this.bounds.xMin, this.bounds.yMax - this.bounds.yMin)
    this.renderer.noStroke()
    let nb = 0
    for (let id in this.bullets) {
      s = this.bullets[id]
      if (this.onScreen(s.context.x, s.context.y)) s.draw(me, this.ships)
    }
    for (let id in this.planets) {
      s = this.planets[id]
      if (me && s.owner === me.id) nb++
      if (this.onScreen(s.context.x, s.context.y)) s.draw(me, this.ships)
    }
    let ex = null
    for (let id in this.asteroids) {
      s = this.asteroids[id]
      if (this.onScreen(s.context.x, s.context.y)) {
        ex = parseInt(s.context.e)
        if (ex === 1) {
          this.explosions.push(new Explosion(parseFloat(s.context.x), parseFloat(s.context.y), this.renderer))
        } else {
          s.draw(me)
        }
      }
    }
    if (observators) {
      for (let id in this.ships) {
        s = this.ships[id]
        if (typeof observators[id] !== 'undefined' && this.onScreen(s.context.x, s.context.y)) {
          s.draw(me, observators[id])
        } else {
          s.draw(me)
        }
      }
    } else {
      for (let id in this.ships) {
        s = this.ships[id]
        s.draw(me)
      }
    }
    for (let i = 0, l = this.explosions.length, s; i < l; i++) {
      this.explosions[i].draw()
    }
    this.renderer.pop()
    if (me) {
      this.renderer.text(`Score: ${Math.round(me.s)}`, 10, 20)
      this.renderer.text(`Vie: ${me.l}%`, 10, 40)
      const leader = []
      let sh
      for (let i in this.ships) {
        sh = this.ships[i]
        leader.push({ name: sh.name, score: sh.context.s })
      }
      leader.sort((a, b) => b.score - a.score)
      for (let i = 0, l = leader.length > 5 ? 5 : leader.length; i < l; i++) {
        this.renderer.text(`${i+1} - ${leader[i].name}: ${Math.round(leader[i].score)}`, CONSTANTS.CANVAS_WIDTH - 100, 20*(i+1))
      }
      if (nb) {
        this.renderer.text(`Planet${nb > 1 ? 's' : ''}: ${nb}`, 10, 60)
      } else {
        this.renderer.text(`No planet`, 10, 60)
      }
    }
  }
}

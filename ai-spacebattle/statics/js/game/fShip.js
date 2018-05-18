class Ship extends Element {
  constructor (id, name, context, renderer, log) {
    super(id, context, renderer, log)

    this.name = name
    this.debug('Create ship ' + id)
  }

  draw (player) {
    const id = this.id
    if (!this.context) return
    const x = parseFloat(this.context.x)
    const y = parseFloat(this.context.y)
    const r = this.renderer
    const a = parseFloat(this.context.a) - Math.PI / 2
    const l = parseInt(this.context.l)
    const s = parseInt(this.context.s)
    const d = parseInt(this.context.d)
    const g = parseInt(this.context.g)
    const o = this.context.o
    if (l > 0) {
      const alpha = 255 - g * 10
      if (player && id === player.id) {
        r.fill(255, 255, 255, alpha)
      } else {
        r.fill(255, 255, 255, alpha)
      }
      r.push()
      const width = CONSTANTS.SHIP_SIZE * 2 * l / CONSTANTS.MAX_LIFE 
      r.rect(x - CONSTANTS.SHIP_SIZE, y + CONSTANTS.SHIP_SIZE, width, 4)
      r.push()
      r.stroke(255)
      r.strokeWeight(1)
      r.noFill()
      r.rect(x - CONSTANTS.SHIP_SIZE, y + CONSTANTS.SHIP_SIZE, CONSTANTS.SHIP_SIZE * 2, 4)
      const length = r.simul ? (String(s).length * 3) : (this.name.length * 3)
      const name = r.simul ? s : this.name
      r.strokeWeight(0.5)
      // r.text(this.name, x - length, y + CONSTANTS.SHIP_SIZE + 20)
      r.text(name, x - length, y + CONSTANTS.SHIP_SIZE + 20)
      r.pop()
      r.translate(x, y)
      
      r.rotate(a)
      r.triangle(-CONSTANTS.SHIP_SIZE/2, 0, CONSTANTS.SHIP_SIZE/2, 0, 0, CONSTANTS.SHIP_SIZE)
      
      r.pop()

      // r.push()
      // r.stroke(255)
      // r.strokeWeight(1)
      // r.fill(255)
      // r.arc(0, 0, 100, 100, r.PI, r.PI + 1.5)
      // r.pop()

      this.drawObs()
    }
  }

  lerp (norm, min, max) {
    return (max - min) * norm + min
  }

  setObs (o) {
    this.obs = o
  }

  drawObs () {
    if (this.obs && this.obs.length) {
      const x = parseFloat(this.context.x)
      const y = parseFloat(this.context.y)
      const a = parseFloat(this.context.a) - Math.PI / 2
      const r = this.renderer
      r.push()
      r.strokeWeight(1)
      r.translate(x, y)
      r.rotate(a)
      // PLANETS
      for (let i = 0, l = this.obs.length - 1, ox, oy, mult; i < l; i += 2) {
        mult = i < 4 ? 4 : 1
        ox = this.obs[i]
        oy = this.obs[i + 1]
        r.stroke(0, 255, 255)
        if (i < 3) { // planets
          r.stroke(0, 255, 0)         
        } else if (i < 7) { // ships
          r.stroke(255, 255, 0)
        } else if (i < 11) { // asteroids
          r.stroke(255, 0, 255)
        } else if (i < 15) { //bonuses
          r.stroke(0, 255, 0)
        } else if (i < 24) { // bullets
          r.stroke(0, 255, 255)
        } else { // wall
          r.stroke(255, 255, 0)
        }
        if (i < 24) {
          if (ox === 1 && oy === 1) continue
          ox = this.lerp(ox, -CONSTANTS.PLANET_MAX_RADIUS * mult, CONSTANTS.PLANET_MAX_RADIUS * mult)
          oy = this.lerp(oy, -CONSTANTS.PLANET_MAX_RADIUS * mult, CONSTANTS.PLANET_MAX_RADIUS * mult)
          r.line(0, 0, ox, oy)
          r.ellipse(ox, oy, 10, 10)
        } else if (i <  26) {
          if (ox !== 1) {
            ox = this.lerp(ox, 0, CONSTANTS.PLANET_MAX_RADIUS * mult)
            r.line(0, 0, -ox, 0)
            r.ellipse(-ox, 0, 10, 10)
          }
          if (oy !== 1) {
            oy = this.lerp(oy, 0, CONSTANTS.PLANET_MAX_RADIUS * mult)
            r.line(0, 0, oy, 0)
            r.ellipse(oy, 0, 10, 10)
          }
        } else {
          if (ox !== 1) {
            ox = this.lerp(ox, 0, CONSTANTS.PLANET_MAX_RADIUS * mult)
            r.line(0, 0, 0, -ox)
            r.ellipse(0, -ox, 10, 10)
          }
          if (oy !== 1) {
            oy = this.lerp(oy, 0, CONSTANTS.PLANET_MAX_RADIUS * mult)
            r.line(0, 0, 0, oy)
            r.ellipse(0, oy, 10, 10)
          }
        }
      }
      r.pop()
    }
  }
}
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
    const t = this.context.t
    const le = parseInt(this.context.le)
    const lo = parseFloat(this.context.lo)
    const re = Math.round(parseFloat(this.context.re) * 1000) / 1000
    const o = this.context.o
    if (l > 0) {
      const alpha = 255 - g * 10
      if (player && id === player.id) {
        r.fill(255, 255, 255, alpha)
      } else if (le === 1) {
        r.fill(0, 255, 0, alpha)
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
      const length = r.simul ? (String(re).length * 3) : (this.name.length * 3)
      const name = r.simul ? re : this.name
      r.strokeWeight(0.5)
      // r.text(this.name, x - length, y + CONSTANTS.SHIP_SIZE + 20)
      r.text(name, x - length, y + CONSTANTS.SHIP_SIZE + 20)
      r.pop()
      r.translate(x, y)
      if (obs && o && o.length) {
        let ox, oy
        r.push()
        // PLANETS
        if (o[0] !== 1 || o[1] !== 1) { // p1
          r.stroke(0, 255, 0)
          ox = this.lerp(o[0], -CONSTANTS.PLANET_MAX_RADIUS * 4, CONSTANTS.PLANET_MAX_RADIUS * 4)
          oy = this.lerp(o[1], -CONSTANTS.PLANET_MAX_RADIUS * 4, CONSTANTS.PLANET_MAX_RADIUS * 4)
          r.line(0, 0, ox, oy)
        }
        if (o[4] !== 1 || o[5] !== 1) { // p2
          r.stroke(0, 255, 0)
          ox = this.lerp(o[4], -CONSTANTS.PLANET_MAX_RADIUS * 4, CONSTANTS.PLANET_MAX_RADIUS * 4)
          oy = this.lerp(o[5], -CONSTANTS.PLANET_MAX_RADIUS * 4, CONSTANTS.PLANET_MAX_RADIUS * 4)
          r.line(0, 0, ox, oy)
        }
        // SHIPS
        if (o[8] !== 1 || o[9] !== 1) { // p1
          r.stroke(255, 0, 0)
          ox = this.lerp(o[8], -CONSTANTS.PLANET_MAX_RADIUS, CONSTANTS.PLANET_MAX_RADIUS)
          oy = this.lerp(o[9], -CONSTANTS.PLANET_MAX_RADIUS, CONSTANTS.PLANET_MAX_RADIUS)
          r.line(0, 0, ox, oy)
        }
        if (o[14] !== 1 || o[15] !== 1) { // p2
          r.stroke(255, 0, 0)
          ox = this.lerp(o[14], -CONSTANTS.PLANET_MAX_RADIUS, CONSTANTS.PLANET_MAX_RADIUS)
          oy = this.lerp(o[15], -CONSTANTS.PLANET_MAX_RADIUS, CONSTANTS.PLANET_MAX_RADIUS)
          r.line(0, 0, ox, oy)
        }
        // ASTEROIDS
        if (o[20] !== 1 || o[21] !== 1) { // p1
          r.stroke(255, 0, 255)
          ox = this.lerp(o[20], -CONSTANTS.PLANET_MAX_RADIUS, CONSTANTS.PLANET_MAX_RADIUS)
          oy = this.lerp(o[21], -CONSTANTS.PLANET_MAX_RADIUS, CONSTANTS.PLANET_MAX_RADIUS)
          r.line(0, 0, ox, oy)
        }
        if (o[24] !== 1 || o[25] !== 1) { // p2
          r.stroke(255, 0, 255)
          ox = this.lerp(o[24], -CONSTANTS.PLANET_MAX_RADIUS, CONSTANTS.PLANET_MAX_RADIUS)
          oy = this.lerp(o[25], -CONSTANTS.PLANET_MAX_RADIUS, CONSTANTS.PLANET_MAX_RADIUS)
          r.line(0, 0, ox, oy)
        }
        // BONUSES
        if (o[28] !== 1 || o[29] !== 1) { // p1
          r.stroke(0, 255, 0)
          ox = this.lerp(o[28], -CONSTANTS.PLANET_MAX_RADIUS, CONSTANTS.PLANET_MAX_RADIUS)
          oy = this.lerp(o[29], -CONSTANTS.PLANET_MAX_RADIUS, CONSTANTS.PLANET_MAX_RADIUS)
          r.line(0, 0, ox, oy)
        }
        if (o[30] !== 1 || o[31] !== 1) { // p2
          r.stroke(0, 255, 0)
          ox = this.lerp(o[30], -CONSTANTS.PLANET_MAX_RADIUS, CONSTANTS.PLANET_MAX_RADIUS)
          oy = this.lerp(o[31], -CONSTANTS.PLANET_MAX_RADIUS, CONSTANTS.PLANET_MAX_RADIUS)
          r.line(0, 0, ox, oy)
        }
        // BULLETS
        if (o[32] !== 1 || o[33] !== 1) { // p1
          r.stroke(255, 0, 0)
          ox = this.lerp(o[32], -CONSTANTS.PLANET_MAX_RADIUS, CONSTANTS.PLANET_MAX_RADIUS)
          oy = this.lerp(o[33], -CONSTANTS.PLANET_MAX_RADIUS, CONSTANTS.PLANET_MAX_RADIUS)
          r.line(0, 0, ox, oy)
        }
        if (o[36] !== 1 || o[37] !== 1) { // p2
          r.stroke(255, 0, 0)
          ox = this.lerp(o[36], -CONSTANTS.PLANET_MAX_RADIUS, CONSTANTS.PLANET_MAX_RADIUS)
          oy = this.lerp(o[37], -CONSTANTS.PLANET_MAX_RADIUS, CONSTANTS.PLANET_MAX_RADIUS)
          r.line(0, 0, ox, oy)
        }
        if (o[40] !== 1 || o[41] !== 1) { // p1
          r.stroke(255, 0, 0)
          ox = this.lerp(o[40], -CONSTANTS.PLANET_MAX_RADIUS, CONSTANTS.PLANET_MAX_RADIUS)
          oy = this.lerp(o[41], -CONSTANTS.PLANET_MAX_RADIUS, CONSTANTS.PLANET_MAX_RADIUS)
          r.line(0, 0, ox, oy)
        }
        if (o[44] !== 1 || o[45] !== 1) { // p2
          r.stroke(255, 0, 0)
          ox = this.lerp(o[44], -CONSTANTS.PLANET_MAX_RADIUS, CONSTANTS.PLANET_MAX_RADIUS)
          oy = this.lerp(o[45], -CONSTANTS.PLANET_MAX_RADIUS, CONSTANTS.PLANET_MAX_RADIUS)
          r.line(0, 0, ox, oy)
        }
        // WALLS
        if (o[48] !== 1 || o[49] !== 1) { // p1
          r.stroke(255, 255, 0)
          ox = this.lerp(o[48], -CONSTANTS.PLANET_MAX_RADIUS, CONSTANTS.PLANET_MAX_RADIUS)
          oy = this.lerp(o[49], -CONSTANTS.PLANET_MAX_RADIUS, CONSTANTS.PLANET_MAX_RADIUS)
          r.line(0, 0, ox, oy)
        }
        if (o[50] !== 1 || o[51] !== 1) { // p2
          r.stroke(255, 255, 0)
          ox = this.lerp(o[50], -CONSTANTS.PLANET_MAX_RADIUS, CONSTANTS.PLANET_MAX_RADIUS)
          oy = this.lerp(o[51], -CONSTANTS.PLANET_MAX_RADIUS, CONSTANTS.PLANET_MAX_RADIUS)
          r.line(0, 0, ox, oy)
        }
        if (o[52] !== 1 || o[53] !== 1) { // p1
          r.stroke(255, 255, 0)
          ox = this.lerp(o[52], -CONSTANTS.PLANET_MAX_RADIUS, CONSTANTS.PLANET_MAX_RADIUS)
          oy = this.lerp(o[53], -CONSTANTS.PLANET_MAX_RADIUS, CONSTANTS.PLANET_MAX_RADIUS)
          r.line(0, 0, ox, oy)
        }
        if (o[54] !== 1 || o[55] !== 1) { // p2
          r.stroke(255, 255, 0)
          ox = this.lerp(o[54], -CONSTANTS.PLANET_MAX_RADIUS, CONSTANTS.PLANET_MAX_RADIUS)
          oy = this.lerp(o[55], -CONSTANTS.PLANET_MAX_RADIUS, CONSTANTS.PLANET_MAX_RADIUS)
          r.line(0, 0, ox, oy)
        }
        r.pop()
      }
      r.rotate(a)
      r.triangle(-CONSTANTS.SHIP_SIZE/2, 0, CONSTANTS.SHIP_SIZE/2, 0, 0, CONSTANTS.SHIP_SIZE)
      
      r.pop()

      // r.push()
      // r.stroke(255)
      // r.strokeWeight(1)
      // r.fill(255)
      // r.arc(0, 0, 100, 100, r.PI, r.PI + 1.5)
      // r.pop()
    }
  }

  lerp (norm, min, max) {
    return (max - min) * norm + min
  }
}
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
      const alpha = g === 1 ? 50 : 255
      // this.debug(`Ship : ${x}, ${y}, ${a}, ${g}`, true)
      if (player && id === player.id) {
        r.fill(255, 255, 255, alpha)
      } else {
        r.fill(255, 0, 0, alpha)
      }
      r.push()
      const width = CONSTANTS.SHIP_SIZE * 2 * l / CONSTANTS.MAX_LIFE 
      r.rect(x - CONSTANTS.SHIP_SIZE, y + CONSTANTS.SHIP_SIZE, width, 4)
      r.push()
      r.stroke(255)
      r.strokeWeight(1)
      r.noFill()
      r.rect(x - CONSTANTS.SHIP_SIZE, y + CONSTANTS.SHIP_SIZE, CONSTANTS.SHIP_SIZE * 2, 4)
      const length = r.simul ? (String(d).length * 3) : (this.name.length * 3)
      const name = r.simul ? d : this.name
      r.strokeWeight(0.5)
      // r.text(this.name, x - length, y + CONSTANTS.SHIP_SIZE + 20)
      r.text(name, x - length, y + CONSTANTS.SHIP_SIZE + 20)
      r.pop()
      r.translate(x, y)
      if (o && o.length) {
        let ox, oy
        r.push()
        // PLANETS
        if (o[0] !== 0 || o[1] !== 0) { // p1
          r.stroke(0, 255, 0)
          ox = this.lerp(o[0], -CONSTANTS.PLANET_MAX_RADIUS * 2, CONSTANTS.PLANET_MAX_RADIUS * 2)
          oy = this.lerp(o[1], -CONSTANTS.PLANET_MAX_RADIUS * 2, CONSTANTS.PLANET_MAX_RADIUS * 2)
          r.line(0, 0, ox, oy)
        }
        if (o[4] !== 0 || o[5] !== 0) { // p2
          r.stroke(0, 255, 0)
          ox = this.lerp(o[4], -CONSTANTS.PLANET_MAX_RADIUS * 2, CONSTANTS.PLANET_MAX_RADIUS * 2)
          oy = this.lerp(o[5], -CONSTANTS.PLANET_MAX_RADIUS * 2, CONSTANTS.PLANET_MAX_RADIUS * 2)
          r.line(0, 0, ox, oy)
        }
        // SHIPS
        if (o[8] !== 0 || o[9] !== 0) { // p1
          r.stroke(255, 0, 0)
          ox = this.lerp(o[8], -CONSTANTS.PLANET_MAX_RADIUS, CONSTANTS.PLANET_MAX_RADIUS)
          oy = this.lerp(o[9], -CONSTANTS.PLANET_MAX_RADIUS, CONSTANTS.PLANET_MAX_RADIUS)
          r.line(0, 0, ox, oy)
        }
        if (o[13] !== 0 || o[14] !== 0) { // p2
          r.stroke(255, 0, 0)
          ox = this.lerp(o[13], -CONSTANTS.PLANET_MAX_RADIUS, CONSTANTS.PLANET_MAX_RADIUS)
          oy = this.lerp(o[14], -CONSTANTS.PLANET_MAX_RADIUS, CONSTANTS.PLANET_MAX_RADIUS)
          r.line(0, 0, ox, oy)
        }
        // ASTEROIDS
        if (o[18] !== 0 || o[19] !== 0) { // p1
          r.stroke(255, 0, 255)
          ox = this.lerp(o[18], -CONSTANTS.PLANET_MAX_RADIUS, CONSTANTS.PLANET_MAX_RADIUS)
          oy = this.lerp(o[19], -CONSTANTS.PLANET_MAX_RADIUS, CONSTANTS.PLANET_MAX_RADIUS)
          r.line(0, 0, ox, oy)
        }
        if (o[21] !== 0 || o[22] !== 0) { // p2
          r.stroke(255, 0, 255)
          ox = this.lerp(o[21], -CONSTANTS.PLANET_MAX_RADIUS, CONSTANTS.PLANET_MAX_RADIUS)
          oy = this.lerp(o[22], -CONSTANTS.PLANET_MAX_RADIUS, CONSTANTS.PLANET_MAX_RADIUS)
          r.line(0, 0, ox, oy)
        }
        // BONUSES
        if (o[24] !== 0 || o[25] !== 0) { // p1
          r.stroke(0, 255, 0)
          ox = this.lerp(o[24], -CONSTANTS.PLANET_MAX_RADIUS, CONSTANTS.PLANET_MAX_RADIUS)
          oy = this.lerp(o[25], -CONSTANTS.PLANET_MAX_RADIUS, CONSTANTS.PLANET_MAX_RADIUS)
          r.line(0, 0, ox, oy)
        }
        if (o[26] !== 0 || o[27] !== 0) { // p2
          r.stroke(0, 255, 0)
          ox = this.lerp(o[26], -CONSTANTS.PLANET_MAX_RADIUS, CONSTANTS.PLANET_MAX_RADIUS)
          oy = this.lerp(o[27], -CONSTANTS.PLANET_MAX_RADIUS, CONSTANTS.PLANET_MAX_RADIUS)
          r.line(0, 0, ox, oy)
        }
        // BULLETS
        if (o[28] !== 0 || o[29] !== 0) { // p1
          r.stroke(255, 0, 0)
          ox = this.lerp(o[28], -CONSTANTS.PLANET_MAX_RADIUS, CONSTANTS.PLANET_MAX_RADIUS)
          oy = this.lerp(o[29], -CONSTANTS.PLANET_MAX_RADIUS, CONSTANTS.PLANET_MAX_RADIUS)
          r.line(0, 0, ox, oy)
        }
        if (o[30] !== 0 || o[31] !== 0) { // p2
          r.stroke(255, 0, 0)
          ox = this.lerp(o[30], -CONSTANTS.PLANET_MAX_RADIUS, CONSTANTS.PLANET_MAX_RADIUS)
          oy = this.lerp(o[31], -CONSTANTS.PLANET_MAX_RADIUS, CONSTANTS.PLANET_MAX_RADIUS)
          r.line(0, 0, ox, oy)
        }
        if (o[32] !== 0 || o[33] !== 0) { // p1
          r.stroke(255, 0, 0)
          ox = this.lerp(o[32], -CONSTANTS.PLANET_MAX_RADIUS, CONSTANTS.PLANET_MAX_RADIUS)
          oy = this.lerp(o[33], -CONSTANTS.PLANET_MAX_RADIUS, CONSTANTS.PLANET_MAX_RADIUS)
          r.line(0, 0, ox, oy)
        }
        if (o[34] !== 0 || o[35] !== 0) { // p2
          r.stroke(255, 0, 0)
          ox = this.lerp(o[34], -CONSTANTS.PLANET_MAX_RADIUS, CONSTANTS.PLANET_MAX_RADIUS)
          oy = this.lerp(o[35], -CONSTANTS.PLANET_MAX_RADIUS, CONSTANTS.PLANET_MAX_RADIUS)
          r.line(0, 0, ox, oy)
        }
        // WALLS
        if (o[36] !== 0 || o[37] !== 0) { // p1
          r.stroke(255, 255, 0)
          console.log(this.lerp(o[36], -CONSTANTS.PLANET_MAX_RADIUS, CONSTANTS.PLANET_MAX_RADIUS), this.lerp(o[37], -CONSTANTS.PLANET_MAX_RADIUS, CONSTANTS.PLANET_MAX_RADIUS))
          ox = this.lerp(o[36], -CONSTANTS.PLANET_MAX_RADIUS, CONSTANTS.PLANET_MAX_RADIUS)
          oy = this.lerp(o[37], -CONSTANTS.PLANET_MAX_RADIUS, CONSTANTS.PLANET_MAX_RADIUS)
          r.line(0, 0, ox, oy)
        }
        if (o[38] !== 0 || o[39] !== 0) { // p2
          r.stroke(255, 255, 0)
          ox = this.lerp(o[38], -CONSTANTS.PLANET_MAX_RADIUS, CONSTANTS.PLANET_MAX_RADIUS)
          oy = this.lerp(o[39], -CONSTANTS.PLANET_MAX_RADIUS, CONSTANTS.PLANET_MAX_RADIUS)
          r.line(0, 0, ox, oy)
        }
        if (o[40] !== 0 || o[41] !== 0) { // p1
          r.stroke(255, 255, 0)
          ox = this.lerp(o[40], -CONSTANTS.PLANET_MAX_RADIUS, CONSTANTS.PLANET_MAX_RADIUS)
          oy = this.lerp(o[41], -CONSTANTS.PLANET_MAX_RADIUS, CONSTANTS.PLANET_MAX_RADIUS)
          r.line(0, 0, ox, oy)
        }
        if (o[42] !== 0 || o[43] !== 0) { // p2
          r.stroke(255, 255, 0)
          ox = this.lerp(o[42], -CONSTANTS.PLANET_MAX_RADIUS, CONSTANTS.PLANET_MAX_RADIUS)
          oy = this.lerp(o[43], -CONSTANTS.PLANET_MAX_RADIUS, CONSTANTS.PLANET_MAX_RADIUS)
          r.line(0, 0, ox, oy)
        }
        // for (let obs of o) {
        //   r.push()
        //   if (obs.type === 'w') {
        //     r.stroke(255, 255, 0)
        //   } else if (obs.type ==='p') {
        //     r.stroke(0, 255, 0)
        //   } else if (obs.type ==='b') {
        //     r.stroke(0, 255, 255)
        //   } else if (obs.type ==='s') {
        //     r.stroke(0, 0, 255)
        //   } else {
        //     r.stroke(255, 0, 255)
        //   }
        //   r.line(0, 0, obs.x, obs.y)
        // }
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
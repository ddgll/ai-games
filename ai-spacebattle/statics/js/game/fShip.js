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
        for (let obs of o) {
          r.push()
          if (obs.type === 'w') {
            r.stroke(255, 255, 0)
          } else if (obs.type ==='p') {
            r.stroke(0, 255, 0)
          } else if (obs.type ==='b') {
            r.stroke(0, 255, 255)
          } else if (obs.type ==='s') {
            r.stroke(0, 0, 255)
          } else {
            r.stroke(255, 0, 255)
          }
          r.line(0, 0, obs.x, obs.y)
          r.pop()
        }
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
}
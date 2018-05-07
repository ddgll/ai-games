class Ship extends Element {
  constructor (id, context, renderer, log) {
    super(id, context, renderer, log)

    this.debug('Create ship ' + id)
  }

  draw (player) {
    const id = this.id
    if (!this.context) return
    const r = this.renderer
    const x = parseFloat(this.context.x)
    const y = parseFloat(this.context.y)
    const a = parseFloat(this.context.a) - Math.PI / 2
    const l = parseInt(this.context.l)
    const s = parseInt(this.context.s)
    // this.debug(`Ship : ${x}, ${y}, ${a}`, true)
    if (id === player.id) {
      // this.debug(`Ship : ${x}, ${y}, ${a}`, true)
      r.fill(255, 255, 255, 255)
    } else {
      r.fill(255, 0, 0)
    }
    r.push()
    const width = CONSTANTS.SHIP_SIZE * 2 * l / CONSTANTS.MAX_LIFE 
    r.rect(x - CONSTANTS.SHIP_SIZE, y + CONSTANTS.SHIP_SIZE, width, 4)
    r.push()
    r.stroke(255)
    r.strokeWeight(1)
    r.noFill()
    r.rect(x - CONSTANTS.SHIP_SIZE, y + CONSTANTS.SHIP_SIZE, CONSTANTS.SHIP_SIZE * 2, 4)
    r.pop()
    r.translate(x, y)
    r.rotate(a)
    r.triangle(-CONSTANTS.SHIP_SIZE/2, 0, CONSTANTS.SHIP_SIZE/2, 0, 0, CONSTANTS.SHIP_SIZE)
    r.pop()
  }
}
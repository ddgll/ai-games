class Ship extends Element {
  constructor (id, name, context, renderer, log) {
    super(id, context, renderer, log)

    this.name = name
    this.debug('Create ship ' + id)
  }

  draw (player, observations) {
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
    const tx = parseInt(this.context.tx)
    const ty = parseInt(this.context.ty)
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

      const bounds = new Bounds(CONSTANTS)
      r.stroke(255)
      r.strokeWeight(1)
      r.line(bounds.bounds.x1.x, bounds.bounds.x1.y, bounds.bounds.x2.x, bounds.bounds.x2.y)
      r.line(bounds.bounds.x2.x, bounds.bounds.x2.y, bounds.bounds.x3.x, bounds.bounds.x3.y)
      r.line(bounds.bounds.x3.x, bounds.bounds.x3.y, bounds.bounds.x4.x, bounds.bounds.x4.y)
      r.line(bounds.bounds.x4.x, bounds.bounds.x4.y, bounds.bounds.x1.x, bounds.bounds.x1.y)
      const vision = observations && observations.o ? observations.o.v : []
      // console.log(vision)
      for (let i = 0, xr, yr, g, re, index, l = 2 * CONSTANTS.VISION.SIDE; i < l; i++) {
        xr = -(CONSTANTS.VISION.SIDE * CONSTANTS.VISION.WIDTH) + i * CONSTANTS.VISION.WIDTH
        for (let j = 0, ll = CONSTANTS.VISION.TOP + CONSTANTS.VISION.BOTTOM; j < ll; j++){
          yr = -(CONSTANTS.VISION.TOP * CONSTANTS.VISION.WIDTH) + j * CONSTANTS.VISION.WIDTH
          index = i + j
          g = 255 - (vision[index] * 255)
          re = (vision[index] * 255)
          // console.log('FILF', g, re, vision[index])
          r.stroke(255)
          r.fill(re, g, 0, 125)
          r.rect(xr, yr, CONSTANTS.VISION.WIDTH, CONSTANTS.VISION.WIDTH)
        }
      }
      r.triangle(-CONSTANTS.SHIP_SIZE/2, -CONSTANTS.SHIP_SIZE/2, CONSTANTS.SHIP_SIZE/2, -CONSTANTS.SHIP_SIZE/2, 0, CONSTANTS.SHIP_SIZE/2)
      r.pop()
      if ((tx || ty) && CONSTANTS.CANVAS_WIDTH_ORIG && CONSTANTS.CANVAS_HEIGHT_ORIG) {
        r.push()
        r.translate(tx, ty)
        r.fill(0, 255, 0)
        r.ellipse(0, 0, 10, 10)
        r.pop()
      }
    }
  }
}
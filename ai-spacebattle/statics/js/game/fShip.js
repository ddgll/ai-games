class Ship extends Element {
  constructor (id, name, context, renderer, log) {
    super(id, context, renderer, log)

    this.name = name
    this.target = null
    this.debug('Create ship ' + id)
  }

  getNormType (type) {
    switch(type) {
      case 'bo': return -.1
      case 'w': return .9
      case 'p': return .5
      case 'b': return .2
      case 's': return .4
      case 'a': return .3
    }
    return .1
  }

  draw (player, observations) {
    const id = this.id
    if (!this.context) return
    const x = parseFloat(this.context.x)
    const y = parseFloat(this.context.y)
    const r = this.renderer
    const a = parseFloat(this.context.a) - Math.PI / 2
    const l = parseInt(this.context.l)
    // const s = parseInt(this.context.s)
    // const d = parseInt(this.context.d)
    const g = parseInt(this.context.g)
    // const tx = parseInt(this.context.tx)
    // const ty = parseInt(this.context.ty)
    // const o = this.context.o
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
      const length = this.name.length * 3
      const name = this.name
      r.strokeWeight(0.5)
      // r.text(this.name, x - length, y + CONSTANTS.SHIP_SIZE + 20)
      r.text(name, x - length, y + CONSTANTS.SHIP_SIZE + 20)
      r.pop()
      r.translate(x, y)
      r.rotate(a)

      // const getShipCoordinates = (x_, y_, angle) => {
      //   const xp = (Math.cos(angle) * (x_ - x)) + (Math.sin(angle) * (y_ - y))
      //   const yp = (-Math.sin(angle) * (x_ - x)) + (Math.cos(angle) * (y_ - y))
      //   return { x: xp, y: yp }
      // }

      // const bounds = new Bounds(CONSTANTS)
      // r.stroke(255)
      // r.strokeWeight(1)
      // r.line(bounds.bounds.x4.x, bounds.bounds.x4.y, bounds.bounds.x1.x, bounds.bounds.x1.y)
      // r.line(bounds.bounds.x1.x, bounds.bounds.x1.y, bounds.bounds.x2.x, bounds.bounds.x2.y)
      // r.line(bounds.bounds.x2.x, bounds.bounds.x2.y, bounds.bounds.x3.x, bounds.bounds.x3.y)
      // r.line(bounds.bounds.x3.x, bounds.bounds.x3.y, bounds.bounds.x4.x, bounds.bounds.x4.y)
      // const vision = observations && observations.o ? observations.o.v : []
      // let planet, v, rect, red, green, danger
      // // console.log(vision)
      // for (let i = 0, xr, yr, g, re, index, l = 2 * CONSTANTS.VISION.SIDE; i < l; i++) {
      //   xr = -(CONSTANTS.VISION.SIDE * CONSTANTS.VISION.WIDTH) + i * CONSTANTS.VISION.WIDTH
      //   for (let j = 0, ll = CONSTANTS.VISION.TOP + CONSTANTS.VISION.BOTTOM; j < ll; j++){
      //     yr = -(CONSTANTS.VISION.TOP * CONSTANTS.VISION.WIDTH) + j * CONSTANTS.VISION.WIDTH
      //     rect = new Rect(xr, yr, CONSTANTS.VISION.WIDTH, CONSTANTS.VISION.WIDTH)
      //     index = i + j
      //     danger = .1
      //     for (let idx in context.planets) {
      //       planet = context.planets[idx]
      //       v = getShipCoordinates(parseFloat(planet.context.x), parseFloat(planet.context.y), parseFloat(a))
      //       if (rect.circleCollide(parseFloat(v.x), parseFloat(v.y), parseFloat(planet.context.r))) danger += this.getNormType('p')
      //     }
      //     for (let idx in context.asteroids) {
      //       planet = context.asteroids[idx]
      //       v = getShipCoordinates(parseFloat(planet.context.x), parseFloat(planet.context.y), parseFloat(a))
      //       if (rect.circleCollide(parseFloat(v.x), parseFloat(v.y), CONSTANTS.ASTEROID_RADIUS, true)) danger += this.getNormType('a')
      //     }
      //     for (let idx in context.bullets) {
      //       planet = context.bullets[idx]
      //       v = getShipCoordinates(parseFloat(planet.context.x), parseFloat(planet.context.y), parseFloat(a))
      //       if (rect.circleCollide(parseFloat(v.x), parseFloat(v.y), CONSTANTS.BULLET_RADIUS, true)) danger += this.getNormType('b')
      //     }
      //     for (let idx in context.ships) {
      //       planet = context.ships[idx]
      //       v = getShipCoordinates(parseFloat(planet.context.x), parseFloat(planet.context.y), parseFloat(a))
      //       if (rect.triangleCollide(parseFloat(v.x), parseFloat(v.y), CONSTANTS.SHIP_SIZE)) danger += this.getNormType('s')
      //     }
      //     red = (danger * 255)
      //     green = 255 - red
      //     r.stroke(255)
      //     r.strokeWeight(.1)
      //     r.fill(red, 0, 0, 125)
      //     r.rect(xr, yr, CONSTANTS.VISION.WIDTH, CONSTANTS.VISION.WIDTH)
      //   }
      // }
      r.fill(255)
      r.triangle(-CONSTANTS.SHIP_SIZE/2, -CONSTANTS.SHIP_SIZE/2, CONSTANTS.SHIP_SIZE/2, -CONSTANTS.SHIP_SIZE/2, 0, CONSTANTS.SHIP_SIZE/2)
      r.pop()

      const target = observations && observations.t ? observations.t : null
      if (target) this.target = target
      if (this.target && CONSTANTS.CANVAS_WIDTH_ORIG && CONSTANTS.CANVAS_HEIGHT_ORIG) {
        r.push()
        r.translate(this.target.x, this.target.y)
        r.fill(0, 255, 0)
        r.ellipse(0, 0, 10, 10)
        r.pop()
      }
    }
  }
}
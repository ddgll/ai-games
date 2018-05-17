class Asteroid extends Element {
  constructor (id, context, renderer, log) {
    super(id, context, renderer, log)

    this.debug('Create asteroid ' + id)

    this.vertexs = context.v

    this.r = CONSTANTS.BULLET_RADIUS

    this.dead = false
  }

  draw () {
    if (this.dead) return
    const x = parseFloat(this.context.x)
    const y = parseFloat(this.context.y)
    this.renderer.push()
    this.renderer.translate(x, y)
    this.renderer.fill(255, 150)
    this.renderer.beginShape()
    for (let i = 0, l = this.vertexs.length, v; i < l; i++) {
      v = this.vertexs[i]
      this.renderer.vertex(v[0], v[1])
    }
    this.renderer.endShape(this.renderer.CLOSE)
    this.renderer.pop()
  }
}

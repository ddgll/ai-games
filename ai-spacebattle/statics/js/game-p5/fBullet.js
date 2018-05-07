class Bullet extends Element {
  constructor (id, context, renderer, log, me) {
    super(id, context, renderer, log)

    this.debug('Create bullet ' + id + ' =>' + context.o, 's' + me.id === this.owner)

    this.owner = context.o
    this.mine = 's' + me.id === this.owner
    this.x = parseFloat(context.x)
    this.y = parseFloat(context.y)

    this.r = CONSTANTS.BULLET_RADIUS

    this.dead = false
  }

  draw (me, ships) {
    if (this.dead) return
    this.x = this.context.x
    this.y = this.context.y
    if (this.mine) {
      // this.debug('DRAW MY BULLET (' + this.x + ', ' + this.y + ')', true)
      this.renderer.fill(150, 255, 150, 255)
      this.renderer.ellipse(this.x, this.y, this.r, this.r)
    } else {
      this.renderer.fill(255, 0, 0)
      this.renderer.ellipse(this.x, this.y, this.r, this.r)
    }
  }

  angleBetween (x1, y1, x2, y2) {
    const sy = y2 - y1
    const sx = x2 - x1
    const a = Math.atan2(sy, sx)
    return a
  }

  kill () {
    this.dead = true
  }
}
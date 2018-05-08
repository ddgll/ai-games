class Planet extends Element {
  constructor (id, context, renderer, log) {
    super(id, context, renderer, log)

    this.x = parseFloat(context.x)
    this.y = parseFloat(context.y)
    this.r = parseFloat(context.r)

    this.debug('Create planet ' + id)
  }

  draw (player) {
    const id = this.id
    const x = this.x
    const y = this.y
    const r = this.r
    this.renderer.fill(255, 255, 255)
    if (this.context) {
      const owner = parseInt(this.context.o)
      const challenger = parseInt(this.context.c)
      const challenge = parseInt(this.context.cl)
      if (owner === player.id) {
        this.renderer.fill(0, 255, 0)
      }
      if (challenge) {
        this.renderer.push()
        this.renderer.translate(x - 50, y + this.r + 5)
        this.renderer.text('Challenge: ' + challenge, 0, 0)
        this.renderer.pop()
      }
    }
    this.renderer.ellipse(x, y, r, r)
    this.renderer.arc(x, y, r, r, Math.PI, Math.PI / 2)
  }
}
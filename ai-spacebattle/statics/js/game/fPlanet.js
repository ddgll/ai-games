class Planet extends Element {
  constructor (id, context, renderer, log) {
    super(id, context, renderer, log)

    this.x = parseFloat(context.x)
    this.y = parseFloat(context.y)
    this.r = parseFloat(context.r)
    this.owner = parseInt(context.o)
    this.challenge = parseInt(context.cl)
    this.challenger = parseInt(context.c)

    this.debug('Create planet ' + id)
  }

  draw (player, ships) {
    const id = this.id
    const x = this.x
    const y = this.y
    const r = this.r
    if (this.context) {
      const owner = parseInt(this.context.o)
      const challenger = parseInt(this.context.c)
      const challenge = parseInt(this.context.cl)
      if (player && owner === player.id) {
        this.renderer.fill(100, 200, 100)
      } else if (!isNaN(owner)) {
        this.renderer.fill(200, 100, 100)
      } else {
        this.renderer.fill(125, 125, 125)
      }
      this.owner = owner
      this.challenger = challenger
      this.challenge = challenge
      this.renderer.ellipse(x, y, r, r)
      if (typeof ships[owner] !== 'undefined') {
        const name = ships[owner].name
        const letterSpace = 2.5
        this.renderer.push()
        this.renderer.translate(x, y)
        this.renderer.stroke(255)
        this.renderer.strokeWeight(0.5)
        this.renderer.fill(255)
        this.renderer.text(name, 0 - (name.length * letterSpace), -5, (name.length * letterSpace), 15)
        this.renderer.pop()
      }
      if (challenge && challenger != owner) {
        const angle = challenge * 2 * Math.PI / 100
        this.renderer.push()
        this.renderer.translate(x, y)
        // this.renderer.stroke(255)
        // this.renderer.strokeWeight(1)
        if (player && challenger === player.id) {
          this.renderer.fill(0, 255, 0)
        } else {
          this.renderer.fill(255, 255, 0)
        }
        this.renderer.arc(0, 0, r, r, Math.PI, Math.PI + angle)
        this.renderer.pop()
      }
    }
  }
}
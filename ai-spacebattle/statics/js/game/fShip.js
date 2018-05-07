class Ship extends Element {
  constructor (id, context, renderer, log, me) {
    super(id, context, renderer, log)
    this.me = me
    this.sprite = renderer.add.sprite(context.x, context.y, 'heros', 'ship_1.png')
    this.sprite.anchor.setTo(0.5, 0.5)
    if (this.me === id) {
      renderer.camera.follow(this.sprite)
      this.debug('Create ship ' + id)
    } else {
      this.debug('Create ennemy ' + id)
    }
  }

  update (context) {
    this.context = context
    const x = parseFloat(this.context.x)
    const y = parseFloat(this.context.y)
    const a = parseFloat(this.context.a)
    this.sprite.rotation = a + Math.PI / 2
    this.sprite.x = x
    this.sprite.y = y
    // this.debug(`Update ship ${this.id}... ${JSON.stringify(this.context)} !!`, true)
  }
}
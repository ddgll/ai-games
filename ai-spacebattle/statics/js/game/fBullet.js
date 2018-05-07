class Bullet extends Element {
  constructor (id, context, renderer, log, mine) {
    super(id, renderer, log)
    this.mine = mine
    this.sprite = renderer.add.sprite(context.x, context.y, 'effects')
    this.laserSound = renderer.add.audio('laserFx')
    this.sprite.anchor.setTo(0.5, 0.5)
    if (this.mine) {
      this.debug('Create ship bullet ' + id)
      this.sprite.animations.add('shoot', Phaser.Animation.generateFrameNames('BlueScale__', 0, 4, '', 3))
      this.sprite.animations.add('blast', Phaser.Animation.generateFrameNames('BlueBBlast__', 0, 10, '', 3))
      this.sprite.animations.add('explode', Phaser.Animation.generateFrameNames('BlueBulletExplo__', 0, 5, '', 3))
    } else {
      this.debug('Create ennemy bullet' + id)
      this.sprite.animations.add('shoot', Phaser.Animation.generateFrameNames('OrangeScale__', 0, 4, '', 3))
      this.sprite.animations.add('blast', Phaser.Animation.generateFrameNames('OrangeBBlast__', 0, 10, '', 3))
      this.sprite.animations.add('explode', Phaser.Animation.generateFrameNames('OrangeBulletExplo__', 0, 5, '', 3))
    }
    this.sprite.anchor.setTo(-0.8, 0.5)

    const a = parseFloat(this.context.a)
    this.sprite.rotation = a + Math.PI / 2

    this.sprite.events.onAnimationComplete.add(function () {
      // console.log('ANIM FINISHED')
      if (this.sprite.animations.name === 'blast') {
        this.sprite.animations.play('shoot', 30, true)
      } else if (this.sprite.animations.name === 'explode') {
        this.dead = true
      }
    }, this)

    this.sprite.animations.play('blast', 30, false)
  }

  update (context) {
    this.context = context
    const x = parseFloat(this.context.x)
    const y = parseFloat(this.context.y)
    this.sprite.x = x
    this.sprite.y = y
    this.debug(`Update bullet ${this.id}... (${x}, ${y}) !!`, true)
  }

  kill () {
    this.animations.play('explode', 30, false)
    this.dead = true
  }
}
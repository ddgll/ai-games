class Game {
  constructor (id, width, height, socket) {
    this.id = id
    this.width = width
    this.height = height
    this.context = null
    this.socket = null
    this.log = null
    this.frameDiv = null
    this.move = false
    this.mouse = null
    this.isDown = false

    this.frameDiv = document.getElementById('frame')
    this.log = document.getElementById('log')

    this.game = new Phaser.Game(this.width, this.height, Phaser.AUTO, this.id, { preload: this.preload.bind(this), create: this.create.bind(this), update: this.update.bind(this), render: this.render.bind(this) })
  }

  preload () {
    this.game.load.image('background', '/images/background.png')
    this.game.load.atlasJSONHash('heros', '/images/physics/heros-sprite.png', '/images/physics/heros-sprite.json')
    this.game.load.atlas('effects', '/images/physics/effects-0.png', '/images/physics/effects-0.json')
    for (let i = 1; i <= 18; i++) this.game.load.image('planet_' + i, '/images/planets/planet' + i + '.png')
    this.game.load.audio('laserFx', '/images/laser_01.mp3')
  }

  create () {
    this.frameDiv = document.getElementById('frame')
    this.log = document.getElementById('log')

    this.socket = io()
    this.socket.on('connection', function () {
      console.log('Connected')
    })
    this.socket.on('f', this.addContext.bind(this))
    this.socket.on('c', this.fromRemote.bind(this))

    this.game.world.setBounds(0, 0, this.width * 10, this.height * 10)
    this.game.time.desiredFPS = CONSTANTS.FRAME_RATE
    this.game.physics.startSystem(Phaser.Physics.P2JS)

    const bg = this.game.add.tileSprite(0, 0, this.width, this.height, 'background')
    // bg.events.onInputDown.add(this.shoot.bind(this), this.game)
    bg.fixedToCamera = true

    // const b = new Bullet(0, { x: this.width * 5, y: this.height * 5, a: Math.PI }, this.game, this.log, false)
    // this.game.camera.follow(b.sprite)
  }

  shoot () {
    console.log('SHOOT')
  }

  update () {
    if (!this.context || !this.socket) return
    this.context.update(this.frameDiv)
    if (this.game.input.mousePointer.isDown && !this.isDown) {
      this.socket.emit('c', [this.game.input.mousePointer.x,this.game.input.mousePointer.y])
      this.move = !this.move
      this.isDown = true
    } else {
      this.isDown = false
    }
    if (!this.context || !this.context.me || this.game.input.mousePointer.x > this.width || this.game.input.mousePointer.x < 0 || this.game.input.mousePointer.y > this.height || this.game.input.mousePointer.y < 0 || !this.move) return
    const me = this.context.me
    const x = Math.round(this.game.input.mousePointer.x)
    const y = Math.round(this.game.input.mousePointer.y)
    let m
    if (!this.mouse) {
      m = { x, y }
      this.mouse = m
    } else {
      const dMouse = distance(x, y, this.mouse.x, this.mouse.y)
      const dMe = distance(x, y, me.x, me.y)
      if (dMouse > CONSTANTS.MIN_MOVE_PAS) {
        m = { x, y }
        this.mouse = m
      }
    }
    if (m) {
      // console.log('MOUSE MOVE', m)
      this.socket.emit('m', [m.x,m.y])
    }
    this.updateMinimap()
  }
  
  render() {
    if (this.context && this.context.ships && this.context.ships.length) {
      const me = this.context.ships[0]
      if (me.sprite) {
        this.game.debug.spriteInfo(me.sprite, 32, 32);
      }
    }
  }

  addContext (data) {
    this.context = new Context(data, this.game, this.log)
    this.createMiniMap()
  }

  fromRemote (ctx) {
    this.context.fromRemote(ctx)
  }

  createMiniMap () {
    const hero = this.context.me
    if (!hero || !hero.context) return
    //  And display our rect on the top
    this.minimap = this.game.add.group()
    this.minimapTexture = this.game.add.renderTexture(this.game.maxX, this.game.maxY, 'minimap', 100 / this.game.maxX, 0.5)
    let graphics = this.game.add.graphics(0, 0)
    graphics.fixedToCamera = true
    graphics.beginFill(0xFFFF0B, 0.5)
    graphics.lineStyle(1, 0x00ff00, 1)
    graphics.drawRect(this.game.camera.width - 100, this.game.camera.height - 100, 100, 100)
    graphics.lineStyle(0)

    // let miniMap = this.game.add.sprite(this.game.camera.width - 100, this.game.camera.height - 100, this.minimapTexture);
    let miniMap = this.game.add.sprite(0, 0, this.minimapTexture)
    miniMap.fixedToCamera = true

    // this.planets.forEach(function (planet) {
    //   let coords = this.getMinimapCoords(planet.x, planet.y)
    //   // console.log('ADD MINI PLANET', coords);
    //   let pCircle = new Phaser.Circle(coords.x, coords.y, this.getMinimapProportion(100 * planet.scale.x))
    //   graphics.beginFill(0xFF3300, 1)
    //   graphics.drawCircle(pCircle.x, pCircle.y, pCircle.diameter)
    // }, this)

    // let coords = this.getMinimapCoords(this.hero.x, this.hero.y)
    this.minihero = this.game.make.sprite(hero.context.x, hero.context.y, 'heros')
    this.minihero.frame = hero.context.skin || '1'
    this.minihero.scale.setTo(0.2, 0.2)
    this.minihero.anchor.setTo(0.5, 0.5)
    this.minihero.tint = 0x000000
    this.minihero.alpha = 0.8

    this.minimap.addMultiple([graphics, miniMap])
    this.game.world.bringToTop(this.minimap)
  }

  getMinimapCoords(x, y) {
    return { x: (x * 100 / this.game.maxX) + this.game.camera.width - 100, y: (y * 100 / this.game.maxY) + this.game.camera.height - 100 }
  }

  getMinimapProportion (x) {
    return (x * 100 / this.game.maxX)
  }

  updateMinimap () {
    const hero = this.context.me
    if (!hero || !hero.context) return
    let coords = this.getMinimapCoords(hero.x, hero.y)
    if (this.minihero) {
      this.minimapTexture.renderXY(this.minihero, coords.x, coords.y, true)
      this.minihero.rotation = this.hero.rotation
    }
  }
}
const GameContext = require('./game-context')
const CONSTANTS = require('../statics/js/constants')

module.exports = class Game {
  constructor (io, options) {
    this.width = options && options.width ? options.width : CONSTANTS.WIDTH
    this.height = options && options.height ? options.height : CONSTANTS.HEIGHT
    this.xCenter = this.width / 2
    this.yCenter = this.height / 2
    this.context = new GameContext({
      width: this.width,
      height: this.height,
      nbFlushMemmory: 3
    }, io)
    this.frameRate = options && options.frameRate ? options.frameRate : CONSTANTS.FRAME_RATE
    this.intervalMilli = Math.round(1000 / this.frameRate)
    this.intervalEmit = (this.intervalMilli / 2)

    console.log('Launch game with', this.intervalMilli)
    // this.intervalMilli = 1000

    const emit = () => {
      const window = this.context.getWindow()
      io.of('/').emit('c', window)
    }
    const update = () => {
      // const d = new Date().getTime()
      this.context.update()
      // const f = new Date().getTime()
      // console.log('UPDATE Time:', f - d, 'ms')
    }
    this.context.update()

    this.interval = setInterval(update, this.intervalMilli)
    this.intervalEmit = setInterval(emit, this.intervalEmit)
  }

  addShip (name) {
    const ship = this.context.addShip(name)
    const context = this.context.getContext()
    return { ship, context }
  }

  moveShip (id, x, y) {
    this.context.moveShip(id, x, y)
  }

  shoot (id, x, y) {
    this.context.shoot(id, x, y)
  }

  removeShip (id) {
    this.context.removeShip(id)
  }

}
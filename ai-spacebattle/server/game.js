'use strict';

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
    this.io = io
    this.human = false
    this.simulation = false
    this.frameRate = options && options.frameRate ? options.frameRate : CONSTANTS.FRAME_RATE
    this.intervalMilli = Math.round(1000 / this.frameRate)
    this.intervalMilliEmit = (this.intervalMilli / 2)

    console.log('Launch game with', this.intervalMilli)
    // this.intervalMilli = 1000
  }

  stopIntervals () {
    if (this.interval) {
      clearInterval(this.interval)
    }
    if (this.intervalEmit) {
      clearInterval(this.intervalEmit)
    }
  }

  setHuman (bool) {
    if (this.simulation) {
      this.stopIntervals()
      this.human = bool
      this.startIntervals()
    }
  }

  startIntervals () {
    this.stopIntervals()
    if (this.frameRate === 0) {
      const frameRate = this.human ? 30 : 300
      const refresh = frameRate * 0.8
      const updates = frameRate * 0.7
      this.simulation = true
      const update = () => {
        const d = new Date().getTime()
        let f, nb = 0
        do {
          f = new Date().getTime()
          this.context.update()
          nb++
        } while (f - d < updates && !this.human)
        this.io.emit('nb', nb)
        // console.log('NB', nb, 'en ', f-d, 'ms', this.human)
      }
      this.interval = setInterval(update.bind(this), frameRate)

      const emit = () => {
        const context = this.context.getContext()
        if (!context || !context.s) return
        this.io.emit('f', { context: context })
      }
      this.intervalEmit = setInterval(emit.bind(this), refresh)

    } else {
      const emit = () => {
        const window = this.context.getWindow()
        this.io.emit('c', window)
      }
      const update = () => {
        // const d = new Date().getTime()
        this.context.update()
        // const f = new Date().getTime()
        // console.log('UPDATE Time:', f - d, 'ms')
      }
      this.context.update()
  
      this.interval = setInterval(update, this.intervalMilli)
      this.intervalEmit = setInterval(emit, this.intervalMilliEmit)
    }
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
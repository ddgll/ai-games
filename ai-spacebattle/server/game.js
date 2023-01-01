'use strict';

const neurojs = require('../neurojs/framework')
const GameContext = require('./game-context')
const CONSTANTS = require('../statics/js/constants')
const nameGenerator = require('./generator')
const fs = require('fs')
const path = require('path')

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
    this.frameRate = options && options.frameRate ? options.frameRate : CONSTANTS.FRAME_RATE
    this.intervalMilli = Math.round(1000 / this.frameRate)
    this.intervalMilliEmit = (this.intervalMilli / 2)

    // console.log('Launch game with', this.intervalMilli)
  }

  stopIntervals () {
    if (this.interval) {
      clearInterval(this.interval)
    }
    if (this.intervalEmit) {
      clearInterval(this.intervalEmit)
    }
  }

  startIntervals () {
    this.stopIntervals()
    // const emit = () => {
    //   console.log('EMIT Changes')
    //   const window = this.context.getWindow()
    //   this.io.emit('c', window)
    // }
    const update = () => {
      // const d = new Date().getTime()
      this.context.update()
      const window = this.context.getWindow()
      this.io.emit('c', window)
      // const f = new Date().getTime()
      // console.log('UPDATE Time:', f - d, 'ms')
    }
    this.context.update()

    this.interval = setInterval(update, this.intervalMilli)
    // this.intervalEmit = setInterval(emit, this.intervalMilliEmit)
  }

  addShip (name, socketId) {
    const ship = this.context.addShip(name, socketId)
    // console.log('ADD Ship', name, ship)
    const context = this.context.getContext()
    return { ship, context }
  }

  moveShip (id, x, y, o) {
    // console.log('MOVE Ship', id)
    this.context.moveShip(id, x, y, o)
  }

  moveKeyboardShip (id, boosting, angle, fire) {
    // console.log('MOVE Ship keyboard', id, boosting, angle, fire)
    this.context.moveKeyboardShip(id, boosting, angle, fire)
  }

  exists (id) {
    // console.log('Ecxists ?', id)
    return this.context.exists(id)
  }

  shoot (id, x, y) {
    // console.log('SHOOT Ship', id)
    this.context.shoot(id, x, y)
  }

  removeShip (id) {
    // console.log('Remove Ship', id)
    this.context.removeShip(id)
  }

}
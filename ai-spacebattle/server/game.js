'use strict';

const neurojs = require('../../../neurojs-master/src/framework')
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
    this.human = true
    this.training = false
    this.bots = []
    this.brains = null
    this.frameRate = options && options.frameRate ? options.frameRate : CONSTANTS.FRAME_RATE
    this.intervalMilli = Math.round(1000 / this.frameRate)
    this.intervalMilliEmit = (this.intervalMilli / 2)

    console.log('Launch game with', this.intervalMilli)
    // this.intervalMilli = 1000
  }

  createBots (file) {
    // var imported = window.neurojs.NetOnDisk.readMultiPart(buffer)
    let savedBrain = null
    if (file) {
      try {
        savedBrain = neurojs.NetOnDisk.readMultiPart(file.buffer)
        if (savedBrain) console.log('SAVED BRAIN OK')
      } catch (e) {
        savedBrain = null
      }
    }
    
    const states = 62
    const actions = 4
    const temporalWindow = 1
    const input = states + temporalWindow * (states + actions)
    this.bots = []
    this.brains = {
      actor: new neurojs.Network.Model([
        { type: 'input', size: input },
        { type: 'fc', size: 100, activation: 'relu' },
        { type: 'fc', size: 100, activation: 'relu' },
        { type: 'fc', size: 100, activation: 'relu', dropout: 0.5 },
        { type: 'fc', size: actions, activation: 'tanh' },
        { type: 'regression' }
      ]),
      critic: new neurojs.Network.Model([
        { type: 'input', size: input + actions },
        { type: 'fc', size: 200, activation: 'relu' },
        { type: 'fc', size: 200, activation: 'relu' },
        { type: 'fc', size: 1 },
        { type: 'regression' }
      ])
    }
    this.brains.shared = new neurojs.Shared.ConfigPool()
    this.brains.shared.set('actor', this.brains.actor.newConfiguration())
    this.brains.shared.set('critic', this.brains.critic.newConfiguration())

    for (let i = 0, input, brain; i < CONSTANTS.MAX_PLAYER; i++) {
      // input = neurojs.Agent.getInputDimension(states, actions, 1) // states inputs, 9 outputs, et... temporal 1... :p
      brain = new neurojs.Agent({
        actor: savedBrain ? savedBrain.actor.clone() : null,
        critic: savedBrain ? savedBrain.critic : null,

        states: states,
        actions: actions,

        algorithm: 'ddpg',

        temporalWindow: temporalWindow, 

        discount: 0.95, 

        experience: 75e3, 
        learningPerTick: 60, 
        startLearningAt: 900,

        theta: 0.05, // progressive copy

        alpha: 0.1 // advantage learning
      })

      brain.forTraining = true

      this.brains.shared.add('actor', brain.algorithm.actor)
      this.brains.shared.add('critic', brain.algorithm.critic)

      this.context.addShip(nameGenerator('general'), brain)
    }
    console.log('BOTS created')
  }

  learn () {
    for (let i = 0, l = this.context.ships.length, s; i <  l; i++) {
      s = this.context.ships[i]
      if (s.brain) s.brain.learning = true
    }
  }

  train () {
    for (let i = 0, l = this.context.ships.length, s; i <  l; i++) {
      s = this.context.ships[i]
      if (s.brain) s.brain.learning = false
    }
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
      const frameRate = 30
      const refresh = frameRate * 0.8
      const updates = frameRate * 0.7
      this.simulation = true
      const update = () => {
        const d = new Date().getTime()
        let f, nb = 0
        do {
          f = new Date().getTime()
          this.context.update()
          this.brains.shared.step()
          nb++
        } while (f - d < updates && !this.human)
        this.io.emit('nb', nb)
        // console.log('NB', nb, 'en ', f-d, 'ms', this.human)
      }
      this.interval = setInterval(update.bind(this), frameRate)

      const emit = () => {
        const player = this.context.ships.filter(c => !c.brain)
        if (player && player.length) {
          const window = this.context.getWindow()
          this.io.emit('c', window)
        } else {
          const context = this.context.getContext()
          this.io.emit('f', { context: context })
        }
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
        this.brains.shared.step()
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
const Brain = require('./brain')
const CONSTANTS = require('../../statics/js/constants')
const ACTIONS_STRING = require('./actions')
const neurojs = require('../../neurojs/framework')

module.exports = class Sarsa extends Brain {
  constructor (type = 'q-learning') {
    super()

    const states = (CONSTANTS.VISION.TOP + CONSTANTS.VISION.BOTTOM) * (CONSTANTS.VISION.SIDE * 2) + 2
    const actions = ACTIONS_STRING.length
    const temporalWindow = 1
    const input = states + temporalWindow * (states + actions)

    this.brain = new neurojs.Agent({
      type: type, // q-learning or sarsa
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
      ]),

      states: states,
      actions: actions,

      algorithm: 'ddpg', // ddpg or dqn

      temporalWindow: temporalWindow, 

      discount: 0.95, 

      experience: 75e3, 
      learningPerTick: 40, 
      startLearningAt: 900,

      theta: 0.05, // progressive copy

      alpha: 0.1 // advantage learning
    })
  }

  oneHotDecode (zeros){
    const max = Math.max.apply(null, zeros)
    const index = zeros.indexOf(max)
    return ACTIONS_STRING[index]
  }

  forward (inputs) {
    const outputs = this.brain.policy(inputs)
    return this.oneHotDecode(outputs)
  }

  backward (reward) {
    if (this.brain.age > 30000) {
      this.brain.discount = 0
      this.brain.training = false
      // this.brain.alpha = 0
      // this.brain.theta = 0
      return
    }
    this.brain.learn(reward)
  }

  learn () {
    return true
  }

  onE (epsilon) {
    // this.brain.epsilon = epsilon
  }

  console () {
    console.log('DDPG Age:', this.brain.age, 'TRAINING:', this.brain.training)
  }
}
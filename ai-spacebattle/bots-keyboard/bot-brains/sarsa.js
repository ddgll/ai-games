const Brain = require('./brain')
const CONSTANTS = require('../../statics/js/constants')
const ACTIONS_STRING = require('./actions')
const DQNAgent = require('../../rl.js')

module.exports = class Sarsa extends Brain {
  constructor () {
    super()

    const states = (CONSTANTS.VISION.TOP + CONSTANTS.VISION.BOTTOM) * (CONSTANTS.VISION.SIDE * 2)
    const actions = ACTIONS_STRING.length

    this.env = {
      getNumStates: () => states,
      getMaxNumActions: () => actions
    }

    this.spec = {
      update: 'sarsa', // qlearn | sarsa
      gamma: 0.9, // discount factor, [0, 1)
      epsilon: 0.2, // initial epsilon for epsilon-greedy policy, [0, 1)
      alpha: 0.02, // value function learning rate
      experience_add_every: 100, // number of time steps before we add another experience to replay memory
      experience_size: 10000, // size of experience
      learning_steps_per_iteration: 40,
      tderror_clamp: 1.0, // for robustness
      num_hidden_units: states * 2 // number of neurons in hidden layer
    }
    
    this.brain = new DQNAgent(this.env, this.spec)
    this.brain.age = 0
  }

  forward (inputs) {
    const outputs = this.brain.act(inputs)
    return ACTIONS_STRING[outputs]
  }

  backward (reward) {
    if (this.brain.age > 30000) {
      this.brain.epsilon = 0
      return
    }
    this.brain.learn(reward)
    this.brain.age++
  }

  learn () {
    return this.brain.epsilon > 0
  }

  onE (epsilon) {
    this.brain.epsilon = epsilon
  }

  console () {
    console.log('SARSA Age:', this.brain.age, 'TRAINING:', this.brain.epsilon !== 0)
  }
}
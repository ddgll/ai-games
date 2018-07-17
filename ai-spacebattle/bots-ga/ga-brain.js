const Brain = require('../bots-keyboard/bot-brains/brain')
const CONSTANTS = require('../statics/js/constants')
const ACTIONS_STRING = require('../bots-keyboard/bot-brains/actions')

module.exports = class GaBrain extends Brain {
  constructor (brain) {
    super()
    
    this.brain = brain
    this.brain.age = 0
  }

  forward (inputs) {
    const outputs = this.brain.activate(inputs)
    // console.log(inputs)
    // console.log(outputs)
    return this.oneHotDecode(outputs)
  }

  oneHotDecode (zeros) {
    const max = Math.max.apply(null, zeros)
    const index = zeros.indexOf(max)
    return ACTIONS_STRING[index]
  }

  backward (reward) {
    return
  }

  learn () {
    return true
  }

  onE (epsilon) {
    return
  }

  console () {
    // console.log('GA Brain:', this.brain.age, 'TRAINING:', this.brain.epsilon !== 0)
  }
}
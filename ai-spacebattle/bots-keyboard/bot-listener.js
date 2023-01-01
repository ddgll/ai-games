const types = require('./bot-types')
const BrainSarsa = require('./bot-brains/sarsa')
const BrainQLearn = require('./bot-brains/qlearn')
const BrainDdpg = require('./bot-brains/ddpg')
const botSocket = require('./bot-socket')

process.on('message', (data) => {
  const type = types.indexOf(data) >= 0 ? data : null
  if (type) {
    const brain = getBrain(type)
    console.log('CREATE Bot', type)
    botSocket(type, brain, false)
  }
})

const getBrain = (type) => {
  switch (type) {
    case 'qlearn': return new BrainQLearn()
    case 'ddpg-qlearn': return new BrainDdpg('q-learning')
    case 'ddpg-sarsa': return new BrainDdpg('sarsa')
    default: return new BrainSarsa()
  }
}

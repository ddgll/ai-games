// const tf = require('@tensorflow/tfjs')
// const Actor = require('./actor')
// const Critic = require('./critic')
// const ReplayBuffer = require('./replay-buffer')

const OU = (x, mu, theta, sigma) => theta * (mu - x) + sigma * Math.random()

class ActorCritic {
  constructor (statesDim, actionsDim, options, actor, critic) {
    this.actorLearninRate = options && options.actorLearninRate ? options.actorLearninRate : 1e-4
    this.criticLearninRate = options && options.criticLearninRate ? options.criticLearninRate : 1e-4
    this.tau = options && options.tau ? options.tau : 0.001
    this.bufferSize = options && options.bufferSize ? options.bufferSize : 10000
    this.batchSize = options && options.batchSize ? options.batchSize : 64
    this.epsilon = options && options.epsilon ? options.epsilon : 1
    this.epsilonDecay = options && options.epsilonDecay ? options.epsilonDecay : .995
    this.gama = options && options.gama ? options.gama : .99
    this.hidden1Size = options && options.hidden1Size ? options.hidden1Size : 400
    this.hidden2Size = options && options.hidden2Size ? options.hidden2Size : 300
    this.hidden3Size = options && options.hidden2Size ? options.hidden2Size : 400

    this.memory = new ReplayBuffer(this.bufferSize)

    this.statesDim = statesDim
    this.actionsDim = actionsDim

    this.epsilon = 0
    this.indicator = 0
    this.setp = 0
    this.done = false
    this.reward = 0
    this.maxStep = 100000
    this.episodeCount = 2000
    this.EXPLORE = 100000

    this.trainIndicator = true
    this.lastAction = null
    this.lastState = null
    this.inputs = null
    this.reward = null

    // console.log('CREATE Actor')
    this.setActor(actor)
    // console.log('CREATE Critic')
    this.setCritic(critic)

    // console.log('CREATE Optimizer')
    // this.critic.setGrandFunction(this.actor.model.predict.bind(this.actor.model))
  }

  setTraining (bool_) {
    this.trainIndicator = bool_
  }

  isTraining () {
    return this.trainIndicator
  }

  setActor(actor) {
    if (actor) {
      this.actor = actor
    } else {
      this.actor = new Actor (this.statesDim, this.actionsDim, {
        learninRate: this.actorLearninRate,
        tau: this.tau,
        batchSize: this.batchSize,
        hidden1Size: this.hidden1Size,
        hidden2Size: this.hidden2Size,
        hidden3Size: this.hidden3Size,
      })
    }
  }

  setCritic(critic) {
    if (critic) {
      this.critic = critic
    } else {
      this.critic = new Critic (this.statesDim , this.actionsDim, {
        learninRate: this.criticLearninRate,
        tau: this.tau,
        batchSize: this.batchSize,
        hidden1Size: this.hidden1Size,
        hidden2Size: this.hidden2Size,
        hidden3Size: this.hidden3Size,
      })
    }
  }

  remember (s, a, r, t, s2) {
    this.memory.add(s, a, r, t, s2)
  }

  async step (inputs, reward, done, bu) {
    this.loss = 0
    this.epsilon -= 1.0 / this.EXPLORE
    this.actions = tf.zeros([this.actionsDim, 1]).dataSync()
    this.noises = tf.zeros([this.statesDim, 1]).dataSync()
    this.inputs = inputs
    this.reward = reward

    const originalActionsTensor = await this.actor.model.predict(tf.tensor(inputs, [1, this.statesDim]))
    const originalActions = originalActionsTensor.dataSync()

    const epsilon = this.epsilon > 0 ? this.epsilon : 0

    for (let i = 0, l = this.actionsDim; i < l; i++) {
      this.noises[i] = this.trainIndicator * epsilon * OU(originalActions[i],  0.0 , 0.60, 0.30)
      this.actions[i] = originalActions[i] + this.noises[i]
    }

    if (!this.lastAction && !this.lastAction) {
      this.lastState = inputs
    }
    this.lastAction = this.actions
    this.remember(this.lastState, this.lastAction, reward, inputs, done)
    if (bu) {
      await this.batchUpdate()
    }
    this.setp++
    // originalActionsTensor.dispose()
    return this.lastAction
  }

  async batchUpdate () {
    this.lastAction = this.actions
    this.totalReward += this.reward
    this.lastState = this.inputs
    if (this.trainIndicator) {
      const debut = Date.now()
      const yT = []
      const states = []
      const actions = []
      const batch = this.memory.sampleBatch(this.batchSize)
      const batchSize = batch.length
      batch.forEach((b) => {
        states.push(b.s)
        actions.push(Array.from(b.a))
        const state2Tensor = tf.tensor(b.s2, [1, this.statesDim])
        const predictedTargetAction = this.actor.targetModel.predict(state2Tensor)
        const inputs = [ state2Tensor, predictedTargetAction ]
        const qValue = this.critic.model.predict(inputs)
        const data = qValue.asScalar().dataSync()
        const value = b.d ? b.r : b.r + this.gama * data
        yT.push(value)
        qValue.dispose()
        state2Tensor.dispose()
        predictedTargetAction.dispose()
      })
      const yTTensor = tf.tensor2d(yT, [batchSize, 1])
      const sTensor = tf.tensor2d(states, [batchSize, this.statesDim])
      const aTensor = tf.tensor2d(actions, [batchSize, this.actionsDim])
      const finBatch = Date.now()
      // console.log('Creation du batch', finBatch - debut, 'ms')
      try {
        const [ losses, grads ] = await Promise.all([
          this.critic.model.fit([ sTensor, aTensor ], yTTensor, { batchSize }),
          this.critic.gradients(aTensor, yTTensor, yT)
        ])
        // const losses = results[0]
        // const grads = results[1]
        const finCTrain = Date.now()
        // console.log('Critic train & gradients', finCTrain - finBatch, 'ms')
        if (losses.history && losses.history.length) this.loss = (losses.history.loss.reduce((a, b) => a + b) / losses.history.length)
        this.actor.targetTrain()
        const finATTrain = Date.now()
        // console.log('Actor target train', finATTrain - finCTrain, 'ms')
        await this.actor.train(sTensor, grads)
        const finATrain = Date.now()
        // console.log('Actor train', finATrain - finATTrain, 'ms')
        yTTensor.dispose()
        sTensor.dispose()
        aTensor.dispose()
        grads.dispose()
        return this.loss
      } catch (e) {
        console.error(e.message, e.stack)
        return Promise.resolve() // reject('Critic training failed')
      }
    }

    return Promise.resolve()
  }
}

if (!window) module.exports = ActorCritic

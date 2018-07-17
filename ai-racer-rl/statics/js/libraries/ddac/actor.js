// const tf = require('@tensorflow/tfjs')

class Actor {
  constructor (statesDim, actionsDim, options) {
    this.statesDim = statesDim
    this.actionsDim = actionsDim

    this.learninRate = options && options.learninRate ? options.learninRate : 1e-4
    this.tau = options && options.tau ? options.tau : 0.001
    this.batchSize = options && options.batchSize ? options.batchSize : 64
    this.hidden1Size = options && options.hidden1Size ? options.hidden1Size : 400
    this.hidden2Size = options && options.hidden2Size ? options.hidden2Size : 300
    this.hidden3Size = options && options.hidden3Size ? options.hidden3Size : 400

    this.model = this.createNetwork()
    this.targetModel = this.createNetwork()
  }

  createNetwork () {
    const target = !this.actionInputs ? '' : 'Target'
    // console.log('Create actor input layer', this.statesDim)
    const inputs = tf.layers.input({ shape: [ this.statesDim ], name: `actor${target}InputsLayer` })
    // console.log('Create actor first hidden layer')
    const h0 = tf.layers.dense({ units: this.hidden1Size, activation: 'relu', name: `actor${target}FHLayer` }).apply(inputs)
    // console.log('Create actor second hidden layer')
    const h1 = tf.layers.dense({ units: this.hidden2Size, activation: 'linear', name: `actor${target}SHLayer` }).apply(h0)
    // console.log('Create actor output layer')
    const outputs = tf.layers.dense({ units: this.actionsDim, activation: 'tanh', name: `actor${target}OutputsLayer` }).apply(h1)
    
    // console.log('Create model')
    const model = tf.model({ inputs, outputs })

    // console.log('Compile model')
    model.compile({ loss: 'meanSquaredError', optimizer: tf.train.adam(this.learninRate) })

    if (!this.actionInputs) this.actionInputs = inputs
    
    return model
  }

  train (states, actionGrads) {
    return this.model.fit(states, actionGrads)
  }

  targetTrain () {
    return tf.tidy(() => {
      const actorWeights = this.model.getWeights()
      const actorTargetWeights = this.targetModel.getWeights()
      actorWeights.forEach((w, i) => {
        const weight = w.mul(tf.scalar(this.tau))
        const targetWeight = actorTargetWeights[i].mul(tf.scalar(1 - this.tau))
        const newWeight = weight.add(targetWeight)
        actorTargetWeights[i] = newWeight
      })
      this.targetModel.setWeights(actorTargetWeights)
    })
  }
}

if (!window) module.exports = Actor

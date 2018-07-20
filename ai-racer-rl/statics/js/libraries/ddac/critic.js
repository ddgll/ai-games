// const tf = require('@tensorflow/tfjs')

class Critic {
  constructor (statesDim, actionsDim, options) {
    this.statesDim = statesDim
    this.actionsDim = actionsDim

    this.learninRate = options && options.learninRate ? options.learninRate : 1e-4
    this.tau = options && options.tau ? options.tau : 0.001
    this.batchSize = options && options.batchSize ? options.batchSize : 64
    this.hidden1Size = options && options.hidden1Size ? options.hidden1Size : 400
    this.hidden2Size = options && options.hidden2Size ? options.hidden2Size : 300
    this.hidden3Size = options && options.hidden2Size ? options.hidden2Size : 400

    this.actionInputs = null

    this.model = this.createNetwork()
  }

  createNetwork () {
    const target = !this.actionInputs ? '' : 'Target'
    const addLayer = tf.layers.add();

    // console.log('Create critic input states layer')
    const S = tf.layers.input({ shape: [ this.statesDim ], name: `critic${target}SInputsLayer` })
    // console.log('Create critic first hidden states layer')
    const w1 = tf.layers.dense({ units: this.hidden1Size, activation: 'relu', name: `critic${target}SFGLayer` }).apply(S)
    // console.log('Create critic second hidden states layer')
    const h1 = tf.layers.dense({ units: this.hidden2Size, activation: 'relu', name: `critic${target}SSHLayer` }).apply(w1)

    // console.log('Create critic input actions layer')
    const A = tf.layers.input({ shape: [ this.actionsDim ], name: `critic${target}AInputsLayer` })
    // console.log('Create critic first hidden actions layer')
    const a1 = tf.layers.dense({ units: this.hidden2Size, activation: 'relu', name: `critic${target}AFHLayer` }).apply(A)

    // console.log('Merge inputs layers')
    const h2 = addLayer.apply([h1, a1])

    // console.log('Create critic first hidden layer')
    const h3 = tf.layers.dense({ units: this.hidden2Size, activation: 'relu', name: `critic${target}FHLayer` }).apply(h2)
    // console.log('Create critic output layer')
    const V = tf.layers.dense({ units: 1, activation: 'linear', name: `critic${target}OutputsLayer` }).apply(h3)

    // console.log('Create critic model')
    const model = tf.model({ inputs: [ S, A ], outputs: V })

    // console.log('Compile critic model')
    model.compile({ loss: 'meanSquaredError', optimizer: tf.train.adam(this.learninRate) })

    if (!this.actionInputs) {
      this.actionInputs = A
      // console.log('CREATE Magic system')
      this.grModel = tf.sequential({ layers: [
        tf.layers.dense({ units: this.hidden2Size, batchInputShape: [null,1], activation: 'relu', name: `criticGAFHLayer` }),
        tf.layers.dense({ units: this.actionsDim, activation: 'softmax', name: `criticGOutputsLayer` })
      ]})
      // console.log('Compile Magic system')
      this.grModel.compile({ loss: 'meanSquaredError', optimizer: tf.train.adam(this.learninRate) })
    }
    
    return model
  }

  setGrandFunction (f) {
    this.actionGrads = tf.grad(f)
  }

  async gradients (statesTensor, actionsTensor, qValues) {
    const [ losses, pouet ] = await Promise.all([
      this.model.fit([ statesTensor, actionsTensor ], qValues, { batchSize: qValues.length }),
      this.grModel.fit(qValues, actionsTensor)
    ])
    const grads = this.grModel.predictOnBatch(qValues)
    return { losses, grads }
  }

  targetTrain () {
    return tf.tidy(() => {
      const criticWeights = this.model.getWeights()
      const criticTargetWeights = this.targetModel.getWeights()
      criticWeights.forEach((w, i) => {
        const weight = w.mul(tf.scalar(this.tau))
        const targetWeight = criticTargetWeights[i].mul(tf.scalar(1 - this.tau))
        const newWeight = weight.add(targetWeight)
        criticTargetWeights[i] = newWeight
      })
      this.targetModel.setWeights(criticTargetWeights)
    })
  }
}

if (!window) module.exports = Critic

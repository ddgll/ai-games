const path = require('path')
const express = require('express')
const app = express()
const lodash = require('lodash')
const maths = require('./statics/js/maths')

// require('@tensorflow/tfjs-node')
const tf = require('@tensorflow/tfjs')

class ActorCritic {
  constructor (numInputs, numOutputs, options, actor, critic) {
    this.learninRate = options && options.learninRate ? options.learninRate : 1e-4
    this.tau = options && options.tau ? options.tau : 0.001
    this.batchSize = options && options.batchSize ? options.batchSize : 64
    this.epsilon = options && options.epsilon ? options.epsilon : 1
    this.epsilonDecay = options && options.epsilonDecay ? options.epsilonDecay : .995
    this.gama = options && options.gama ? options.gama : .95
    this.hidden1Size = options && options.hidden1Size ? options.hidden1Size : 400
    this.hidden2Size = options && options.hidden2Size ? options.hidden2Size : 300
    this.hidden3Size = options && options.hidden2Size ? options.hidden2Size : 400

    this.memory = new ReplayBuffer(this.batchSize)

    this.numInputs = numInputs
    this.numOutputs = numOutputs

    console.log('CREATE Actor')
    this.setActor(actor)
    this.actorCriticGrad = tf.zeros([this.numInputs], 'float32')
    const actorModelWeights = this.actor.network.trainableWeights
    console.log('actorModelWeights', actorModelWeights)
    const f = (a, b) => b.div(a)
    this.actorGrads = tf.variableGrads(f, actorModelWeights)
    console.log('actorGrads', this.actorGrads)
    const grads = this.zip(this.actorGrads, actorModelWeights)
    console.log('grads', grads)
    this.optimizer = tf.train.adam(this.learninRate).applyGradients( this.actorGrads)

    console.log('CREATE Critic')
    this.setCritic(critic)
    this.criticGrads = tf.gradients(this.critic.network.out, this.critic.actionInputs)

    tf.variableGrads()
  }

  setActor(actor) {
    if (actor) {
      this.actor = actor
    } else {
      this.actor = new Actor (this.numInputs, this.numOutputs, {
        learninRate: this.learninRate,
        tau: this.tau,
        batchSize: this.batchSize,
        hidden1Size: this.hidden1Size,
        hidden2Size: this.hidden2Size,
        hidden3Size: this.hidden3Size,
      })
      this.targetActor = new Actor (this.numInputs, this.numOutputs, {
        learninRate: this.learninRate,
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
      this.critic = new Critic (this.numInputs , this.numOutputs, {
        learninRate: this.learninRate,
        tau: this.tau,
        batchSize: this.batchSize,
        hidden1Size: this.hidden1Size,
        hidden2Size: this.hidden2Size,
        hidden3Size: this.hidden3Size,
      })
      this.targetCritic = new Critic (this.numInputs , this.numOutputs, {
        learninRate: this.learninRate,
        tau: this.tau,
        batchSize: this.batchSize,
        hidden1Size: this.hidden1Size,
        hidden2Size: this.hidden2Size,
        hidden3Size: this.hidden3Size,
      })
    }
  }

  zip (arrays) {
    return Array.apply(null,Array(arrays[0].length)).map(function(_,i){
        return arrays.map(function(array){return array[i]})
    })
  }

  _trainActor (samples) {
    for ({ s, a, r, t, s2 } of samples) {
      const action = this.actor.network.predict(s)
      const grads = this.criticGrads.fit(s, action)
      this.optimize.fit(s, grads)
    }
  }

  _trainCritic (samples) {
    for ({ s, a, r, t, s2 } of samples) {
      if (!s2) {
        const action = this.targetActor.network.predict(t)
        const freward = this.targetCritic.network.predict([t, action])[0][0]
        r += this.gamma * freward
      }
      this.critic.network.fit([ s, a ], r)
    }
  }

  train () {
    const samples = this.memory.sampleBatch(this.batchSize)
    if (samples && samples.length) {
      const rewards = []
      this._trainCritic(samples)
      this._trainActor(samples)
    }
  }

  _updateActorTarget () {
    const actorWeights = this.actor.network.getWeights()
    const actorTargetWeights = this.targetActor.network.getWeights()

    for (i = 0, l = actorTargetWeights.length; i < l; i++) {
      actorTargetWeights[i] = actorWeights[i]
    }
    this.targetActor.network.setWeights(actorTargetWeights)
  }

  _updateCriticTarget () {
    const criticWeights = this.critic.network.getWeights()
    const criticTargetWeights = this.targetActor.network.getWeights()

    for (i = 0, l = criticTargetWeights.length; i < l; i++) {
      criticTargetWeights[i] = criticWeights[i]
    }
    this.tergatCritic.network.setWeights(criticTargetWeights)
  }

  updateTarget () {
    this._updateActorTarget()
    this._updateCriticTarget()
  }

  remember (s, a, r, t, s2) {
    this.memory.add(s, a, r, t, s2)
  }

  act (state) {
    this.epsilon *= this.epsilonDecay
    if (Math.random() < this.epsilon) {
      return 4
    }
    return this.actor.predict(state)
  }
}

class Actor {
  constructor (statesDim, actionsDim, options ) {
    this.statesDim = statesDim
    this.actionsDim = actionsDim

    this.learninRate = options && options.learninRate ? options.learninRate : 1e-4
    this.tau = options && options.tau ? options.tau : 0.001
    this.batchSize = options && options.batchSize ? options.batchSize : 64
    this.hidden1Size = options && options.hidden1Size ? options.hidden1Size : 400
    this.hidden2Size = options && options.hidden2Size ? options.hidden2Size : 300
    this.hidden3Size = options && options.hidden2Size ? options.hidden2Size : 400

    this.createNetwork()
  }

  createNetwork () {
    console.log('Create inputs layer', this.statesDim)
    this.inputs = tf.layers.dense({ units: this.hidden1Size, inputShape: [this.statesDim], activation: 'relu' })
    console.log('Create outputs layer')
    this.out = tf.layers.dense({ units: this.actionsDim, activation: 'tanh' })
    console.log('Create sequential')
    this.network = tf.sequential({
      layers: [
        this.inputs,
        tf.layers.dense({ units: this.hidden2Size, activation: 'relu' }),
        this.out
      ]
    })
    console.log('Compile network')
    this.network.compile({ loss: 'meanSquaredError', optimizer: tf.train.adam(this.learninRate) })
  }
}

class Critic {
  constructor (numInputs) {
    this.statesDim = statesDim
    this.actionsDim = actionsDim

    this.learninRate = options && options.learninRate ? options.learninRate : 1e-4
    this.tau = options && options.tau ? options.tau : 0.001
    this.batchSize = options && options.batchSize ? options.batchSize : 64
    this.hidden1Size = options && options.hidden1Size ? options.hidden1Size : 400
    this.hidden2Size = options && options.hidden2Size ? options.hidden2Size : 300
    this.hidden3Size = options && options.hidden2Size ? options.hidden2Size : 400

    this.createNetwork()
  }

  createNetwork () {
    const inputs = tf.layers.dense({ units: this.hidden1Size, inputShape: [this.statesDim], activation: 'relu' })
    this.statesInput = tf.sequential({
      layers: [
        inputs,
        tf.layers.dense({ units: this.hidden2Size, activation: 'relu' })
      ]
    })
    this.actionInputs = tf.layers.dense({ units: this.hidden2Size, inputShape: [this.actionsDim], activation: 'relu' })

    const addLayer = tf.layers.add();
    this.inputs = addLayer.apply([statesInput, actionInputs])

    this.out = tf.layers.dense({ units: 1, activation: 'relu' })

    this.network = tf.sequential({
      layers: [
        this.inputs,
        tf.layers.dense({ units: this.hidden1Size, activation: 'relu' }),
        out
      ]
    })
    this.network.compile({ loss: 'meanSquaredError', optimizer: tf.train.adam(this.learninRate) })
  }
}

class ReplayBuffer {
  constructor (bufferSize) {
    this.bufferSize = bufferSize
    this.buffer = []
  }

  add (s, a, r, t, s2) {
    const exprience = { s, a, r, t, s2 }
    if (this.buffer.length < this.bufferSize) {
      this.buffer.push(exprience)
    } else {
      this.buffer = this.buffer.slice(1)
      this.buffer.push(exprience)
    }
  }

  size () {
    return this.buffer.length
  }

  sampleBatch (batchSize) {
    const batch = []
    const length = this.buffer.length
    if (length < batchSize) {
      return maths.sample(this.buffer, length)
    } else {
      return maths.sample(this.buffer, batchSize)
    }
  }

  clear () {
    this.buffer = []
  }
}

const options = {
  dotfiles: 'ignore',
  etag: false,
  extensions: ['js', 'css'],
  index: false,
  maxAge: '1d',
  redirect: false,
  setHeaders: function (res) {
    res.set('x-timestamp', Date.now())
  }
}

app.use(express.static('statics', options))

const ACTION_STRINGS = [ 0, 1, 2 ]
const envs = []
for (let i = 0; i < 1000; i++) {
  envs.push({
    state: [ Math.random(), Math.random(), Math.random(), Math.random(), Math.random() ]
  })
}

const ac = new ActorCritic(5, 3)
let env = envs.pop(), nenv, action, reward
while (envs.length) {
  action = ac.act(env)
  
  nenv = envs.pop()
  reward = Math.random()

  ac.remember(env, action, reward, nenv, envs.length > 0)
  ac.train()

  env = nenv
}

function Bird (dadBrain, momBrain, best) {
  this.y = height/2
  this.x = 55
  this.r = 16

  this.killed = false
  this.debug = false

  this.score = 0
  this.fitness = 0

  if (dadBrain) {
    if (momBrain) {
      this.brain = neataptic.Network.crossOver(dadBrain, momBrain)
    } else {
      this.brain = neataptic.Network.fromJSON(dadBrain.toJSON())
    }
    if (!best) this.brain.mutate(neataptic.methods.mutation.MOD_WEIGHT)
  } else {
    this.brain = new neataptic.architect.Perceptron(6, 6, 1)
  }

  this.velocity = 0

  this.resistence = 1
  this.gravity = 0.6
  this.lift = -10
  if (this.debug) {
    this.gravity = 0.1
    this.lift = -5
  }

  this.show = function (bst) {
    if (this.killed) return
    if (bst) {
      stroke(255, 0, 0)
      fill(255, 0, 0)
    } else {
      stroke(255)
      fill(255, 50)
    }
    ellipse(this.x, this.y, this.r*2, this.r*2)
  }

  this.up = function () {
    this.velocity += this.lift - this.velocity
  }

  // this.closets = function (pipes) {
  //   let closets, distance = Infinity
  //   pipes.forEach(p => {
  //     const d = p.x - (this.x - this.r*2)
  //     if (d < distance && d > 0) {
  //       closets = p
  //       distance = d
  //     }
  //   })
  //   return closets
  // }
  this.normalize = function (pipes) {
    let inputs = [ 0, 0, 0 ]
    pipes.forEach(p => {
      inputs[0] += p.top
      inputs[1] += p.bottom
      inputs[2] += p.x
    })
    return inputs
  }

  this.think = function (pipes) {
    if (this.killed) return
    const np = this.normalize(pipes)
    const inputs = [
      Math.sin(this.velocity),
      Math.sin(this.y),
      Math.sin(np[0]),
      Math.sin(np[1]),
      Math.sin(np[2]),
      Math.sin(pipes.length)
    ]
    const output = this.brain.activate(inputs);
    console.log('OUTPUT', output[0])
    if (output[0] > 0.5) this.up()
  }

  this.update = function () {
    if (this.killed) return
    this.score++
    this.velocity += this.gravity
    this.velocity *= this.resistence

    this.y += this.velocity
    if (this.fall()) this.stop()
    if (this.top()) this.bong()
  }

  this.fall = function () {
    return this.y > height - this.r
  }

  this.top = function () {
    return this.y <= this.r*2
  }

  this.stop = function () {
    this.y = height - this.r
    this.velocity = 0
    this.killed = true
  }

  this.bong = function () {
    this.y = this.r*2
    this.velocity = 0
  }
}
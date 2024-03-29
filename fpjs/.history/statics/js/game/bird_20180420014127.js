function Bird (dadBrain, momBrain, p, log) {  
  this.y = height/2
  this.x = width*0.1
  this.r = 4

  this.nodes = nodes
  
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
    this.brain = new neataptic.architect.Perceptron(this.nodes, 64, 1)
  }

  this.velocity = 0

  this.resistence = 1
  this.gravity = 0.6
  this.lift = -16

  this.goup = false

  this.mutate = function () {
    // this.brain = neataptic.Network.fromJSON(dadBrain.toJSON())
    // this.brain.mutate(neataptic.methods.mutation.MOD_BIAS)
    this.brain.mutate(neataptic.methods.mutation.MOD_WEIGHT)
    // this.brain.mutate(neataptic.methods.mutation.MOD_ACTIVATION)
    
    this.reset()
    return this
  }

  this.reset = function () {
    this.y = height/2
    this.x = width*0.1
    this.velocity = 0
    this.killed = false
    this.score = 0
    this.fitness = 0
    this.gravity = 0.6
  }

  this.show = function (bst) {
    if (this.killed) return
    p.fill(255, 0, 0)
    p.ellipse(this.x, this.y, this.r*2, this.r*2)
  }

  this.up = function () {
    this.velocity += this.lift - this.velocity
  }

  this.think = function (vision) {
    if (this.killed || !vision || !vision.length) return
    const output = this.brain.activate(vision);
    this.goup = Math.sin(output[0])
    if (this.goup > 0) {
      this.up()
    }
  }

  this.update = function (bst) {
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
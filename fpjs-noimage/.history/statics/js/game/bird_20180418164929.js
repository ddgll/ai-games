function Bird (dadBrain, momBrain) {
  this.y = height/2
  this.x = 55
  this.r = 16

  this.killed = false
  this.debug = false

  this.score = 0
  this.fitness = 0

  if (dadBrain && momBrain) {
    this.brain = neataptic.Network.crossOver(dadBrain, momBrain)
    this.brain.mutate(neataptic.methods.mutation.MOD_WEIGHT)
  } else {
    this.brain = new neataptic.Network(5, 10, 2)
  }

  this.velocity = 0

  this.resistence = 1
  this.gravity = 0.6
  this.lift = -10
  if (this.debug) {
    this.gravity = 0.1
    this.lift = -5
  }

  this.show = function () {
    if (this.killed) return
    stroke(255)
    fill(255, 50)
    ellipse(this.x, this.y, this.r*2, this.r*2)
  }

  this.up = function () {
    this.velocity += this.lift - this.velocity
  }

  this.closets = function (pipes) {
    let closets, distance = Infinity
    pipes.forEach(p => {
      const d = p.x - this.x
      if (d < distance && d > 0) {
        closets = p
        distance = d
      }
    })
    return closets
  }

  this.think = function (pipes) {
    if (this.killed) return
    const closets = this.closets(pipes)
    if (!closets) return
    const inputs = [
      this.y / height,
      closets.top / height,
      closets.bottom / height,
      closets.x / width,
      closets.bottom - closets.top / height
    ]
    const output = this.brain.activate(inputs);
    if (output[0] > output[1]) this.up()
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
    return this.y <= this.r
  }

  this.stop = function () {
    this.y = height - this.r
    this.velocity = 0
    this.killed = true
  }

  this.bong = function () {
    this.y = this.r
    this.velocity = 0
  }
}
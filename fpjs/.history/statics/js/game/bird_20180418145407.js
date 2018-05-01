function Bird () {
  this.y = height/2
  this.x = 55
  this.r = 16
  this.debug = false

  this.brain = new neataptic.architect.Perceptron(4, 4, 1)

  this.velocity = 0

  this.resistence = 1
  this.gravity = 0.6
  this.lift = -10
  if (this.debug) {
    this.gravity = 0.1
    this.lift = -5
  }

  this.show = function () {
    fill(255)
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
    const closets = this.closets(pipes)
    const inputs = [
      this.y / height,
      closets.top / height,
      closets.bottom / height,
      closets.x / width
    ]
    const output = this.brain.activate(input);
    if (output[0] > 0.5) this.up()
  }

  this.update = function () {
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
  }

  this.bong = function () {
    this.y = this.r
    this.velocity = 0
  }
}
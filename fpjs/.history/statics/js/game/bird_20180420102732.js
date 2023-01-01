function Bird (dadBrain, momBrain, p, log, best) {  
  this.y = p.height/2
  this.x = p.width*0.1
  this.r = 2

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
    this.brain.mutate(neataptic.methods.mutation.MOD_ALL)
    // this.brain.mutate(neataptic.methods.mutation.MOD_WEIGHT)
    // this.brain.mutate(neataptic.methods.mutation.MOD_ACTIVATION)
  } else {
    this.brain = new neataptic.architect.Perceptron(this.nodes, 64, 64, 32, 12, 1)
  }

  this.velocity = 0

  this.resistence = 1
  this.gravity = 0.6
  this.lift = -12

  this.goup = false

  this.reset = function () {
    this.y = p.height/2
    this.x = p.width*0.1
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

  this.think = function (memory) {
    if (this.killed || !memory || !memory.length) return
    let v, str
    const line = IMAGE_SIZE * 4
    memory.forEach(frame => {
      if (!v) v = frame
      v = v.map((pixel, index) => pixel === BACKGROUND ? frame[index] : pixel)
    })
    // log.innerHTML = ''
    // var img = p.createImage(IMAGE_SIZE, IMAGE_SIZE)
    // img.loadPixels()
    // // console.log(v.length, img.pixels.length, IMAGE_SIZE * IMAGE_SIZE)
    // let ct = 0
    // v.forEach((p, index) => {
    //   const uu = p * 255
    //   img.pixels[index + 0] = uu
    //   img.pixels[index + 1] = uu
    //   img.pixels[index + 2] = uu
    //   img.pixels[index + 3] = 255
    // })
    // img.updatePixels()
    // log.appendChild(img.canvas)

    // str = ''
    // for (let i = 0, l = v.length; i < l; i++) {
    //   if (i%IMAGE_SIZE === 0) str += '<br>'
    //   str += Math.round(v[i] * 255)
    // }
    // if (log) log.innerHTML = str
    const output = this.brain.activate(v);
    if (output[0] > 0.5) {
      // console.log(output[0])
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
    return this.y > p.height - this.r
  }

  this.top = function () {
    return this.y <= this.r*2
  }

  this.stop = function () {
    this.y = p.height - this.r
    this.velocity = 0
    this.killed = true
  }

  this.bong = function () {
    this.y = this.r*2
    this.velocity = 0
  }
}
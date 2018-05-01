var POINTS_VELOCITY = 2
const BLUR = 0.8
function Bird (brain_, p, log, logs, best) {  
  this.y = p.height/2
  this.x = p.width*0.1
  this.r = 3

  this.nodes = nodes

  this.best = best
  this.frameCount = 0
  
  this.killed = false
  this.debug = false
  this.first = false

  this.score = 0
  this.fitness = 0

  if (brain_) {
    this.brain = brain_
    if (!this.best) {
      console.log('MUTATE')
      // this.brain.mutate(neataptic.methods.mutation.MOD_BIAS)
      this.brain.mutate(neataptic.methods.mutation.MOD_WEIGHT)
      // this.brain.mutate(neataptic.methods.mutation.MOD_ACTIVATION)
    }
  } else {
    this.brain = new neataptic.architect.Perceptron(this.nodes, 64, 12, 1)
  }

  this.velocity = 0

  this.resistence = 1
  this.gravity = 0.3
  this.lift = -2

  this.reset = function () {
    this.y = p.height/2
    this.x = p.width*0.1
    this.velocity = 0
    this.killed = false
    this.score = 0
    this.fitness = 0
    this.gravity = 0.6
  }

  this.show = function () {
    if (this.killed) return
    if (this.best) {
      p.fill(255, 0, 0)
    } else {
      p.fill(255)
    }
    p.ellipse(this.x, this.y, this.r*2, this.r*2)
    this.frameCount++
  }

  this.up = function () {
    this.velocity += this.lift - this.velocity
  }

  this.die = function () {
    this.killed = true
    logs.elt.style.color = 'blue'
    logs.elt.style.fontWeight = 'normal'
    logs.elt.style.fontSize = '10px'
    logs.elt.innerHTML = this.score
  }

  this.isBackground = function (pix) {
    const diff = 50
    return pix > BACKGROUND - diff && pix < BACKGROUND + diff
  }

  this.think = function (memory) {
    if (this.killed || !memory || !memory.length) return
    let v = [], str
    for (let i = 0, l = memory[0].length; i < l; i++) v.push(BACKGROUND)
    const line = IMAGE_SIZE * 4
    let blur = memory.length * BLUR
    memory.forEach((frame, idx) => {
      v = v.map((pixel, index) => {
        if (this.isBackground(pixel) && this.isBackground(frame[index])) return BACKGROUND
        if (this.isBackground(pixel)) return frame[index] * blur
        return pixel * blur
      }).map(pi => this.isBackground(pi) ? BACKGROUND : pi)
      blur = (memory.length - idx - 1) * BLUR
      if (blur < 0) blur = 0
    })
    log.elt.innerHTML = ''
    var img = p.createImage(IMAGE_SIZE, IMAGE_SIZE)
    img.loadPixels()
    // console.log(v.length, img.pixels.length, IMAGE_SIZE * IMAGE_SIZE)
    let ct = 0
    v = v.map((p, index) => {
      img.pixels[index + 0] = p
      img.pixels[index + 1] = p
      img.pixels[index + 2] = p
      img.pixels[index + 3] = 255
      return p / 255.0
    })
    img.resize(p.width, p.height)
    img.updatePixels()
    log.elt.appendChild(img.canvas)
    if (this.first) {
      logs.elt.style.color = 'red'
      logs.elt.style.fontWeight = 'bold'
      logs.elt.style.fontSize = '14px'
    } else {
      logs.elt.style.color = 'black'
      logs.elt.style.fontWeight = 'normal'
      logs.elt.style.fontSize = '10px'
    }
    logs.elt.innerHTML = this.score

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

    if (this.velocity > POINTS_VELOCITY || this.velocity < -POINTS_VELOCITY) this.score += 10 * 10 * Math.abs(this.velocity)
    this.y += this.velocity
    if (this.fall()) this.stop()
    if (this.top()) this.bong()
  }

  this.fall = function () {
    if (this.y > p.height - this.r) {
      this.score -= 1000
      return true
    }
    return false
  }

  this.top = function () {
    return this.y <= this.r*2
  }

  this.stop = function () {
    this.y = p.height - this.r
    this.velocity = 0
    this.die()
  }

  this.bong = function () {
    this.y = this.r*2
    this.velocity = 0
  }
}
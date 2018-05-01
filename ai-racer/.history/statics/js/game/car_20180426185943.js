function Car (x, y, brain, isBest, isTest) {
  this.position = createVector(x, y)
  this.r = 5
  this.heading = 0
  this.rotation = 0

  this.velocity = createVector(0, 0)
  this.isBoosting = false

  this.killed = false
  this.debug = false
  this.first = false


  this.best = isBest
  this.test = isTest

  this.score = 0
  this.frames = 0
  this.fitness = 0

  if (brain) {
    this.brain = brain
  } else {
    this.brain = new neataptic.architect.Random(13, 8, 1)
  }

  this.draw = function () {
    if (this.killed) return
    console.log('DRAW CAR', this.isBoosting)
    if (this.best) {
      stroke(255, 0, 0)
      fill(255, 0, 0)
    } else if (this.test) {
      stroke(0, 255, 0)
      fill(0, 255, 0)
    } else {
      stroke(255)
      fill(255, 50)
    }
    push()
    translate(this.position.x, this.position.y)
    rotate(this.heading + PI / 2)
    triangle(-this.r, this.r, this.r, this.r, 0, -this.r)
    pop()
  }

  this.setRotation = function (angle) {
    this.rotation = angle
  }

  this.turn = function () {
    this.heading += this.rotation
  }

  this.boosting = function (boosting) {
    this.isBoosting = boosting
  }

  this.boost = function () {
    const force = p5.Vector.fromAngle(this.heading)
    this.velocity.add(force)
  }

  this.closets = function (pipes) {
    let closets, distance = Infinity
    pipes.forEach(p => {
      const d = p.x - (this.x - this.r*2)
      if (d < distance && d > 0) {
        closets = p
        distance = d
      }
    })
    return closets
  }

  this.think = function (pipes) {
    if (this.killed) return
    const p1 = pipes && pipes.length >= 1 ? pipes[0] : null
    const p2 = pipes && pipes.length >= 2 ? pipes[1] : null
    const p3 = pipes && pipes.length >= 2 ? pipes[1] : null
    const inputs = [
      this.velocity / width,
      this.y / height,
      p1 ? distance(this.x, this.y, p1.x, p1.top) / width : 0,
      p1 ? distance(this.x, this.y, p1.x, p1.bottom) / width : 0,
      p1 ? p1.width / width : 0,
      p2 ? distance(this.x, this.y, p2.x, p2.top) / width : 0,
      p2 ? distance(this.x, this.y, p2.x, p2.bottom) / width : 0,
      p2 ? p2.width / width : 0,
      p3 ? distance(this.x, this.y, p3.x, p3.top) / width : 0,
      p3 ? distance(this.x, this.y, p3.x, p3.bottom) / width : 0,
      p3 ? p3.width / width : 0,
      pipes.length / width
    ]
    const output = this.brain.activate(inputs);
    if (output[0] > 0.5) this.up()
  }

  this.update = function () {
    if (this.killed) return
    this.score++
    this.frames++
    this.turn()
    if (this.isBoosting) {
      this.boost()
    }
    this.position.add(this.velocity)
    this.velocity.mult(AIR_RESISTENCE)

    // if (this.fall()) this.stop()
    // if (this.top()) this.bong()
  }

  this.die = function () {
    this.killed = true
  }

  this.fall = function () {
    if (this.y > height - this.r) {
      this.score -= 1000
      return true
    }
    return false
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
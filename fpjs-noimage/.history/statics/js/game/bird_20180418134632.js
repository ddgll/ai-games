function Bird () {
  this.y = height/2
  this.x = 55
  this.r = 16

  this.gravity = 0.1
  this.velocity = 0

  this.lift = -5

  this.show = function () {
    fill(255)
    ellipse(this.x, this.y, this.r*2, this.r*2)
  }

  this.up = function () {
    this.velocity += this.lift - this.velocity
  }

  this.update = function () {
    this.velocity += this.gravity
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
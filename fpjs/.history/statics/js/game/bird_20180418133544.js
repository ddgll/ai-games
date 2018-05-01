function Bird () {
  this.y = height/2
  this.x = 55
  this.r = 16

  this.gravity = 1
  this.velocity = 0

  this.show = function () {
    fill(255)
    ellipse(this.x, this.y, this.r*2, this.r*2)
  }

  this.update = function () {
    this.velocity += this.gravity
    this.y += this.velocity
  }
}
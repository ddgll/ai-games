function Bird () {
  this.y = width/2
  this.x = 25
  this.r = 8

  this.show = function () {
    fill(255)
    ellipse(this.x, this.y, this.r*2, this.r*2)
  }
}
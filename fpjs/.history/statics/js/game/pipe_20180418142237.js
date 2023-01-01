function Pipe () {
  this.top = random(height/2)
  this.bottom = random(height/2)

  this.width = 20
  this.speed = 1

  this.x = width

  this.show = function () {
    fill(255)
    rect(this.x, 0, this.width, this.top)
    rect(this.x, height-this.bottom, this.width, this.bottom)
  }

  this.update = function () {
    this.x -= this.speed
  }

  this.offscreen = function () {
    return this.x < -this.width/2
  }

  this.hits = function (bird) {
    return (bird.y < this.top || this.y > height - this.bottom) && (bird.x > this.x && bird.x < this.x + this.width)
  }
}
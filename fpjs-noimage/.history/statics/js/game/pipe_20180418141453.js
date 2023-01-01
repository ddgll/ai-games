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
}
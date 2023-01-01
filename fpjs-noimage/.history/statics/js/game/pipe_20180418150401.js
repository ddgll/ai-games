function Pipe () {
  this.top = random(height/2)
  this.bottom = random(height/2)

  this.width = 20
  this.speed = 1

  this.hightlight = false

  this.x = width

  this.show = function () {
    fill(255)
    if (this.hightlight) {
      fill(255, 0, 0)
    }
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
    if (bird.y < this.top || bird.y > height - this.bottom) {
      if (bird.x > this.x && bird.x < this.x + this.width) {
        console.log('HITS !!')
        this.hightlight = true
        return true
      }
    }
    this.hightlight = false
    return false
  }
}
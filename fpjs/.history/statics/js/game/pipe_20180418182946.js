function Pipe () {
  let spacing, centery
  do {
    spacing = 200
    centery = random(spacing, height - spacing)
    this.top = centery - spacing / 2;
    this.bottom = height - (centery + spacing / 2);
  } while (this.bottom - this.top < spacing - 10)
  

  this.x = width
  this.width = 50
  this.speed = 1.5

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
    return (bird.y - bird.r < this.top || bird.y + bird.r > height - this.bottom) && (bird.x + bird.r > this.x && bird.x - bird.r < this.x + this.width)
  }
}
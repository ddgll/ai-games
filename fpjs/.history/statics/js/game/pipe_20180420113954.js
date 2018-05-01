function Pipe (p) {
  const spacing = 30
  const centery = p.random(spacing, p.height - spacing)
  this.top = centery - spacing / 2;
  this.bottom = this.top + spacing;
  

  this.x = p.width
  this.width = 6
  this.speed = 0.75

  this.show = function () {
    p.stroke(255)
    p.fill(255)
    if (this.hightlight) {
      p.fill(255, 0, 0)
    }
    p.rect(this.x, 0, this.width, this.top)
    p.rect(this.x, this.bottom, this.width, p.height)
  }

  this.update = function () {
    this.x -= this.speed
  }

  this.offscreen = function () {
    return this.x < -this.width/2
  }

  this.hits = function (bird) {
    if (!bird) return
    if (bird.x + bird.r > this.x && bird.x - bird.r < this.x + this.width) {
      if (bird.y - bird.r < this.top) {
        bird.killed = true
        bird.score *= 0.3
      } else if (bird.y + bird.r > this.bottom) {
        bird.killed = true
      }
    }
    if (bird.x + bird.r > this.x && bird.x - bird.r < this.x) {
      bird.score += 100
    }
  }
}
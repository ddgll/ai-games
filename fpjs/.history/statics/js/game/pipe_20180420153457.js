function Pipe (p) {
  const spacing = 30
  const centery = p.random(spacing, p.height - spacing)
  this.top = centery - spacing / 2;
  this.bottom = this.top + spacing;
  

  this.x = p.width
  this.width = 6
  this.speed = 0.75

  this.show = function (p5instance) {
    p5instance.stroke(255)
    p5instance.fill(255)
    if (this.hightlight) {
      p5instance.fill(255, 0, 0)
    }
    p5instance.rect(this.x, 0, this.width, this.top)
    p5instance.rect(this.x, this.bottom, this.width, p.height)
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
        bird.die()
        if(bird.x + bird.r < this.x) bird.score -= 200
      } else if (bird.y + bird.r > this.bottom) {
        bird.die()
      }
    }
    if (bird.x + bird.r > this.x && bird.x - bird.r < this.x) {
      bird.score += 100
    }
  }
}
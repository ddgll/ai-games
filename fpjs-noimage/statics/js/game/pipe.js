function Pipe () {
  let spacing = random(80, 120)
  if (!hard) spacing += 75 
  if (shard) spacing = 65
  if (hhard) spacing = 45
  let centery = random(spacing, height - spacing)
  if (shard) centery = random(100, height - 100)
  this.top = centery - spacing / 2;
  this.bottom = this.top + spacing;
  

  this.x = width
  this.width = random(30, 80)
  this.speed = 3

  this.show = function () {
    stroke(255)
    fill(255)
    if (this.hightlight) {
      fill(255, 0, 0)
    }
    rect(this.x, 0, this.width, this.top)
    rect(this.x, this.bottom, this.width, height)
  }

  this.update = function () {
    this.x -= this.speed
  }

  this.offscreen = function () {
    return this.x < -this.width/2
  }

  this.hits = function (bird) {
    if (!bird || bird.killed) return
    if (bird.x + bird.r > this.x && bird.x - bird.r < this.x + this.width && (bird.y - bird.r < this.top || bird.y + bird.r > this.bottom)) return bird.die()
    if (bird.x + bird.r > this.x && bird.x - bird.r < this.x) bird.score += 100
  }
}
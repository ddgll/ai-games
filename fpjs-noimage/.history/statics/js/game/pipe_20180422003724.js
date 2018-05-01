function Pipe () {
  let spacing = random(80, 120)
  if (!hard) spacing += 75 
  if (shard) spacing = 50
  let centery = random(spacing, height - spacing)
  if (shard) centery = random(80, height - 80)
  this.top = centery - spacing / 2;
  this.bottom = this.top + spacing;
  

  this.x = width
  this.width = random(30, 80)
  this.speed = 1.5
  if (hard) this.speed = 1.3
  if (shard) this.speed = 1.1

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
    if (!bird) return false
    return (bird.y - bird.r < this.top || bird.y + bird.r > this.bottom) && (bird.x + bird.r > this.x && bird.x - bird.r < this.x + this.width)
  }
}
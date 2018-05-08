class Particle {
  constructor (x, y, p){
    this.renderer = p
    this.x = x
    this.y = y
    this.lifespan = CONSTANTS.PARTICLE_LIFE

    do {
      this.vel = { x: Math.random() * (this.randomInt(0, 10) - 5), y: Math.random() * (this.randomInt(0, 10) - 5) }
    } while (this.vel.x === 0 && this.vel.y === 0)
  }

  randomInt (min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  update () {
    this.vel.x *= 0.95
    this.vel.y *= 0.95
    this.lifespan -= 20;

    this.x += this.vel.x
    this.y += this.vel.y
  }

  done () {
    return (this.lifespan < 0)
  }

  draw (r) {
    // console.log('PP', this.x, this.y, this.vel.x, this.vel.y)
    const rand = Math.random()
    this.renderer.push()
    if (rand < 0.33) {
      this.renderer.fill(255, 0, 0, this.lifespan)
    } else if (rand < .66) {
      this.renderer.fill(255, 255, 0, this.lifespan)
    } else {
      this.renderer.fill(255, 128, 0, this.lifespan)
    }
    this.renderer.ellipse(this.x, this.y, 5, 5)
    this.renderer.pop()
  }
}
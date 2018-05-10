class Explosion {
  constructor (x, y, p){
    this.renderer = p
    this.x = x
    this.y = y

    // console.log('NEW EXPLOSION', x, y)
    
    this.particles = []
    for (let i = 0; i < 10; i++) {
      this.particles.push(new Particle(x, y, p))
    }
  }

  update () {
    for (let i = this.particles.length - 1, p; i >= 0; i--) {
      p = this.particles[i]
      p.update() 
      if (p.done()) {
        this.particles.splice(i, 1)
      }
    }
  }

  done () {
    return (this.lifespan < 0)
  }

  draw (r) {
    // console.log('DRAW EXPLOSION', this.particles.length)
    for (let i = 0, l = this.particles.length; i < l; i++) {
      this.particles[i].draw()
    }
  }
}
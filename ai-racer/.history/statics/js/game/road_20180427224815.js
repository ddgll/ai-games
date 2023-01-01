class Road {
  constructor (x, y, type, options) {
    this.id = uuid()
    this.x = x
    this.y = y

    this.nbSides = 6
    this.walls = []

    this.color = options && options.color || 'rgb(125, 125, 125)'
    this.wallColor = options && options.wallColor || 'rgb(255, 85, 85)'
    this.size = options && options.size || 10
    this.wallSize = options && options.wallSize || WALL_SIZE

    for (let i = 0, x, y, b; i < this.nbSides ;i++) {
      x = this.x + this.size * Math.cos(i * 2 * Math.PI / this.nbSides)
      y = this.y + this.size * Math.sin(i * 2 * Math.PI / this.nbSides)
      b = Bodies.rectangle(x, y, this.size, this.wallSize)
      b.rotate(i * 2 * Math.PI / this.nbSides)
      this.walls.push()
    }
  }

  draw () {
    noStroke()
    this.walls.forEach(w => {
      fill(this.wallColor)
      rect(w.position.x, w.position.y, this.size, this.wallSize)
    })
    this.polygon(this.x, this.y, this.size - this.wallSize, 1)
  }

  polygon(x, y, radius, npoints) {
    const angle = TWO_PI / npoints
    beginShape()
    for (let a = 0, sx, sy; a < TWO_PI; a += angle) {
      sx = x + cos(a) * radius
      sy = y + sin(a) * radius
      vertex(sx, sy)
    }
    endShape(CLOSE)
  }
}
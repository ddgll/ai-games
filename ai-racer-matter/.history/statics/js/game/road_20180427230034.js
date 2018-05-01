class Road {
  constructor (x, y, type, options) {
    this.id = uuid()
    this.x = x
    this.y = y

    this.nbSides = 6

    this.color = options && options.color || 'rgb(125, 125, 125)'
    this.size = options && options.size || 20

    this.vectors = this.polygon(this.x, this.y, this.size, this.nbSides)
    this.body = Bodies.fromVertices(this.x, this.y, this.vectors)
  }

  draw () {
    noStroke()
    fill(this.color)
    beginShape()
    endShape(CLOSE)
    this.polygon(this.x, this.y, this.size, this.nbSides)
  }

  polygon (x, y, radius, npoints) {
    const angle = TWO_PI / npoints
    const vectors = []
    for (let a = 0, sx, sy; a < TWO_PI; a += angle) {
      sx = x + cos(a) * radius
      sy = y + sin(a) * radius
      vectors.push([sx, sy])
    }
    return vectors
  }
}
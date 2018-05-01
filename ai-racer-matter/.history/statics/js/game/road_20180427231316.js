class Road {
  constructor (x, y, world, options) {
    this.x = x
    this.y = y

    this.nbSides = 6

    this.color = options && options.color || 'rgb(125, 125, 125)'
    this.size = options && options.size || 20

    this.vectors = this.polygon(this.x, this.y, this.size, this.nbSides)
    this.body = Matter.Bodies.fromVertices(this.x, this.y, this.vectors, { isStatic: true })
    console.log(this.body)
  }

  draw () {
    noStroke()
    fill(this.color)
    beginShape()
    endShape(CLOSE)
    this.polygon(this.x, this.y, this.size, this.nbSides)
  }

  polygon (x, y, radius, npoints) {
    const angle = Math.PI * 2 / npoints
    const vectors = []
    for (let a = 0, sx, sy; a < Math.PI * 2; a += angle) {
      sx = x + Math.cos(a) * radius
      sy = y + Math.sin(a) * radius
      vectors.push(Matter.Vector.create(sx, sy))
    }
    return vectors
  }
}
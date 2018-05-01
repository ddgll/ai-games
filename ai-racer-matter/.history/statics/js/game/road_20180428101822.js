class Road {
  constructor (x, y, options) {
    this.x = x
    this.y = y

    this.nbSides = 6

    this.color = options && options.color || 'rgb(125, 125, 125)'
    this.size = options && options.size || 20

    this.vectors = this.polygon(this.x, this.y, this.size, this.nbSides)
    const path = this.vectors.map(v => v.x + ' ' + v.y).join(' ')
    const bodyOptions = {
      isStatic: true,
      render: {
        fillStyle: 'red',
        strokeStyle: 'blue',
        lineWidth: 4
      }
    }
    this.body = Bodies.fromVertices(this.x, this.y, Matter.Vertices.fromPath(path), bodyOptions)
  }

  polygon (x, y, radius, npoints) {
    const angle = Math.PI * 2 / npoints
    const vectors = []
    for (let a = 0, sx, sy; a < Math.PI * 2; a += angle) {
      sx = x + Math.cos(a) * radius
      sy = y + Math.sin(a) * radius
      vectors.push({ x: sx, y: sy })
    }
    return vectors
  }
}
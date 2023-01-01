class Road {
  constructor (x, y, options) {
    this.x = x
    this.y = y

    this.sides = options && options.size || 6

    this.color = options && options.color || 'rgb(255, 0, 0)'
    this.size = options && options.size || 20
    
    const bodyOptions = {
      isStatic: true,
      render: {
        fillStyle: 'red',
        strokeStyle: 'blue',
        lineWidth: 4
      }
    }
    this.body = Bodies.polygon(this.x, this.y, this.sides, this.size, bodyOptions)
    this.body.render.fillStyle = 'red'
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
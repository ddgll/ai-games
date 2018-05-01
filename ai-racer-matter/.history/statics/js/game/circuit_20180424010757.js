class Circuit {
  constructor (x, y) {
    this.x = x
    this.y = y
    this.size = size || DEFAULT_CIRCUIT_SIZE
    this.roads = []
    this.createRoads()
  }

  createRoads () {
    let x = this.x
    let y = this.y
    for (let i = 0, r; i < this.size; i++) {
      r = new Road(x, y, DEFAULT_ROAD_WIDTH, DEFAULT_ROAD_LENGTH, 'horizontal')
      this.roads.push(r)
      x = r.xFin
      y = r.yFin
    }
  }

  draw () {
    this.roads.forEach(road => road.draw())
  }
}
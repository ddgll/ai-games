class Circuit {
  constructor (x, y) {
    this.x = x
    this.y = y
    this.size = size || DEFAULT_CIRCUIT_SIZE
    this.roads = this.createRoads(x, y)
  }
}
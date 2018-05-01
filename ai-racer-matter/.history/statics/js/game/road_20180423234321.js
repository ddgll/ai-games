class Road {
  constructor (x, y, type, length, width) {
    this.x = x
    this.y = y
    this.length = length || DEFAULT_ROAD_LENGTH
    this.width = width || DEFAULT_ROAD_WIDTH
    this.type = type
    if (typeof this[this.type] === 'function') {
      this[this.type]()
    } else {
      throw ('Unknown road type')
    }
  }

  horizontal () {
    this.xFin = this.x + this.length
    this.yFin = this.y
  }
}
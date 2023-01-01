class Road {
  constructor (x, y, type, length) {
    this.x = x
    this.y = y
    this.type = type
    if (typeof this[this.type] === 'function') {
      this[this.type]()
    } else {
      throw ('Unknown road type')
    }
  }

  horizontal () {
    this.xFin = this.x
  }
}
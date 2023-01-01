class Road {
  constructor (x, y, type) {
    this.x = x
    this.y = y
    this.type = type
    if (typeof this[this.type] === 'function') {

    } else {
      throw ('Unknown road type')
    }
  }
}
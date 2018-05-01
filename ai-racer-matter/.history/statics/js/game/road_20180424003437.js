class Road {
  constructor (x, y, type, options) {
    this.x = x
    this.y = y
    this.length = options && options.length || DEFAULT_ROAD_LENGTH
    this.width = options && options.width || DEFAULT_ROAD_WIDTH
    this.type = type
    this.color = options && options.color || '#3a3a3a'
    if (typeof this[this.type] === 'function') {
      this[this.type]()
    } else {
      throw ('Unknown road type')
    }
  }

  bloc () {
    this.xFin = this.x + this.length
    this.yFin = this.y
  }

  trun () {
    this.xFin = this.x + this.length
    this.yFin = this.y
  }

  draw () {
    this[`${this.type}Draw`]()
  }

  horizontalDraw () {
    stoke(255, 0, 0)
    fill(this.color)
    rect(this.x, this.y, this.length, this.width)
  }

  turnDraw () {
    stoke(255, 0, 0)
    arc(this.x, this.y, this.length, this.width, 0, HALF_PI);
  }
}
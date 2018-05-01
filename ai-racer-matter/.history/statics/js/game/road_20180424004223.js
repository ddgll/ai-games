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

  horizontal () {
    this.xFin = this.x + this.length
    this.yFin = this.y
  }

  turn () {
    this.width *= 2
    this.length *= 2
    this.xFin = this.x + this.length
    this.yFin = this.y
  }

  draw () {
    this[`${this.type}Draw`]()
  }

  horizontalDraw () {
    noStroke()
    fill(this.color)
    rect(this.x, this.y, this.length, this.width)
    stroke(255, 0, 0)
    line(this.x, this.y, this.x + this.length, this.y + this.width)
  }

  turnDraw () {
    stroke(255, 0, 0)
    fill(this.color)
    arc(this.x, this.y, this.length, this.width, 0, HALF_PI);
  }
}
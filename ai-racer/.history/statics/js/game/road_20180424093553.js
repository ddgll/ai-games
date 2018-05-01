class Road {
  constructor (x, y, type, options) {
    this.x = x
    this.y = y
    this.length = options && options.length || DEFAULT_ROAD_LENGTH
    this.width = options && options.width || DEFAULT_ROAD_WIDTH
    this.type = type
    this.direction = options && options.direction || 1
    this.color = options && options.color || '#3a3a3a'
    if (typeof this[this.type] === 'function' && typeof this[`${this.type}Draw`] === 'function') {
      this[this.type]()
    } else {
      throw ('Unknown road type', this.type)
    }
  }

  rightLeft () {
    this.xFin = this.x + this.length * this.direction
    this.yFin = this.y
  }

  leftRight () {
    this.xFin = this.x + this.length * this.direction
    this.yFin = this.y
  }

  upDown () {
    this.xFin = this.x
    this.yFin = this.y + this.width * this.direction
  }

  downUp () {
    this.xFin = this.x
    this.yFin = this.y + this.width * this.direction
  }

  leftUp () {
    this.width *= 2
    this.length *= 2
    this.xFin = this.x + this.width / 2
    this.yFin = this.y - this.length / 2
  }

  leftDown () {
    this.width *= 2
    this.length *= 2
    this.xFin = this.x + this.length / 2
    this.yFin = this.y - this.width / 2
  }

  rightUp () {
    this.width *= 2
    this.length *= 2
    this.xFin = this.x + this.length
    this.yFin = this.y
  }

  rightDown () {
    this.width *= 2
    this.length *= 2
    this.xFin = this.x + this.length
    this.yFin = this.y
  }

  draw () {
    this[`${this.type}Draw`]()
    if (DEBUG) {
      stroke(0, 255, 0)
      fill(0, 255, 0, 50)
      ellipse(this.x, this.y, 10, 10)
      stroke(255, 0, 0)
      fill(255, 0, 0)
      ellipse(this.xFin, this.yFin, 7, 7)
    }
  }

  leftRightDraw () {
    stroke(this.color)
    fill(this.color)
    rect(this.x, this.y, this.length, this.width)
    stroke(255, 0, 0)
    line(this.x, this.y, this.x + this.length, this.y)
    line(this.x, this.y + this.width, this.x + this.length, this.y + this.width)
  }

  rightLeftDraw () {
    stroke(this.color)
    fill(this.color)
    rect(this.x, this.y, this.length, this.width)
    stroke(255, 0, 0)
    line(this.x, this.y, this.x + this.length, this.y)
    line(this.x, this.y + this.width, this.x + this.length, this.y + this.width)
  }

  upDownDraw () {
    stroke(this.color)
    fill(this.color)
    rect(this.x, this.y, this.length, this.width)
    stroke(255, 0, 0)
    line(this.x, this.y, this.x, this.y + this.width)
    line(this.x + this.length, this.y, this.x + this.length, this.y + this.width)
  }

  downUpDraw () {
    stroke(this.color)
    fill(this.color)
    rect(this.x, this.y, this.length, this.width)
    stroke(255, 0, 0)
    line(this.x, this.y, this.x, this.y + this.width)
    line(this.x + this.length, this.y, this.x + this.length, this.y + this.width)
  }

  leftUpDraw () {
    stroke(255, 0, 0)
    fill(this.color)
    arc(this.x, this.y, this.length, this.width, 0, HALF_PI);
  }

  leftDownDraw () {
    stroke(255, 0, 0)
    fill(this.color)
    arc(this.x, this.y + this.length / 2, this.length, this.width, -HALF_PI, 0);
  }

  rightUpDraw () {
    stroke(255, 0, 0)
    fill(this.color)
    arc(this.x, this.y, this.length, this.width, PI - HALF_PI, PI);
  }

  rightDownDraw () {
    stroke(255, 0, 0)
    fill(this.color)
    arc(this.x, this.y + this.length / 2, this.length, this.width, PI, PI + HALF_PI);
  }
}
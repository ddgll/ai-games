class Road {
  constructor (x, y, type, options) {
    this.id = uuid()
    this.x = x
    this.y = y
    this.xFin = null
    this.yFin = null
    this.xCenter = null
    this.yCenter = null
    this.xCollide = null
    this.yCollide = null
    this.xCar = null
    this.yCar = null
    this.walls = []
    this.distance = 0
    this.rotation = 0
    this.reverse = false
    this.carDistance = null
    this.fade = 50
    this.width = options && options.width || DEFAULT_ROAD_WIDTH
    this.type = type
    this.number = TYPES_STRING.indexOf(type)
    this.arc = false
    this.color = options && options.color || 'rgba(176, 176, 176, 1)'
    if (typeof this[this.type] === 'function' && typeof this[`${this.type}Draw`] === 'function') {
      this[this.type]()
    } else {
      throw ('Unknown road type', this.type)
    }
  }

  contains (x, y) {
    const types = this.splitType()
    if (this.arc) {
      return collidePointArc(x, y, this.xCenter, this.yCenter, this.width / 2 - 2, this.rotation, HALF_PI)
    } else if (types.debut !== 'down' && types.debut !== 'up') {
      return collidePointRect(x, y, this.xCenter - this.width / 2, this.yCenter - 2 - this.width / 2, this.width, this.width - 2)
    } else {
      return collidePointRect(x, y, this.xCenter - 2 - this.width / 2, this.yCenter - this.width / 2, this.width - 2, this.width)
    }
  }

  collide (x, y) {
    if (this.arc) {
      console.log('ARC', !collidePointArc(x, y, this.xCenter, this.yCenter, this.width / 2 - 4, this.rotation, HALF_PI), collidePointArc(x, y, this.xCenter, this.yCenter, this.width / 2, this.rotation, HALF_PI), !collidePointArc(x, y, this.xCenter, this.yCenter, this.width / 2 - 4, this.rotation, HALF_PI) && 
      collidePointArc(x, y, this.xCenter, this.yCenter, this.width / 2, this.rotation, HALF_PI))

      fill(this.color)
      arc(this.xCenter, this.yCenter, (this.width - WALL_SIZE) * 2, this.width - WALL_SIZE * 2, -HALF_PI, 0)

      return !collidePointArc(x, y, this.xCenter, this.yCenter, this.width / 2 - WALL_SIZE, this.rotation, HALF_PI) && 
              collidePointArc(x, y, this.xCenter, this.yCenter, this.width / 2, this.rotation, HALF_PI)
    } else {
      for (let i = 0, l = this.walls.length, w; i < l; i++) {
        w = this.walls[i]
        if (collidePointRect(x, y, w.x, w.y, w.w, w.h)) {
          return true
        }
      }
    }
    return false
  }

  resetCar () {
    this.xCar = null
    this.yCar = null
    this.reverse = false
  }

  intersects (road) {
    if (this.arc) {
      if (road.arc) {
        return collidePointArc(road.xFin, road.yFin, this.xCenter, this.yCenter, this.width / 2, this.rotation, HALF_PI)  ||
                collidePointArc(road.xCollide, road.yCollide, this.xCenter, this.yCenter, this.width / 2, this.rotation, HALF_PI)
      } else {
        return collidePointArc(road.xFin, road.yFin, this.xCenter, this.yCenter, this.width / 2, this.rotation, HALF_PI)
      }
    } else {
      return collidePointRect(road.xFin, road.yFin, this.xCenter - this.width / 2, this.yCenter - this.width / 2, this.width, this.width)
    }
  }

  adjacent (road) {
    if (road.xFin == this.x && road.yFin == this.y) return true
    if (road.x == this.xFin && road.y == this.yFin) return true
    return false
  }

  rightLeft () {
    this.xFin = this.x - this.width
    this.yFin = this.y
    this.xCenter = this.x - this.width / 2
    this.yCenter = this.y
    this.distance = this.width
    this.walls = [
      { x: this.x - this.width, y: this.y - this.width / 2, w: this.width, h: WALL_SIZE },
      { x: this.x - this.width, y: this.y + this.width / 2 - WALL_SIZE, w: this.width, h: WALL_SIZE }
    ]
  }

  leftRight () {
    this.xFin = this.x + this.width
    this.yFin = this.y
    this.xCenter = this.x + this.width / 2
    this.yCenter = this.y
    this.distance = this.width
    this.walls = [
      { x: this.x, y: this.y - this.width / 2, w: this.width, h: WALL_SIZE },
      { x: this.x, y: this.y + this.width / 2 - WALL_SIZE, w: this.width, h: WALL_SIZE }
    ]
  }

  upDown () {
    this.xFin = this.x
    this.yFin = this.y + this.width
    this.xCenter = this.x
    this.yCenter = this.y + this.width / 2
    this.distance = this.width
    this.walls = [
      { x: this.x - this.width / 2, y: this.y, w: WALL_SIZE, h: this.width },
      { x: this.x - WALL_SIZE + this.width / 2, y: this.y, w: WALL_SIZE, h: this.width }
    ]
  }

  downUp () {
    this.xFin = this.x
    this.yFin = this.y - this.width
    this.xCenter = this.x
    this.yCenter = this.y - this.width / 2
    this.distance = (2 * PI * (this.width / 2)) / 4
    this.walls = [
      { x: this.x - this.width / 2, y: this.y - this.width, w: WALL_SIZE, h: this.width },
      { x: this.x - WALL_SIZE + this.width / 2, y: this.y - this.width, w: WALL_SIZE, h: this.width }
    ]
  }

  leftUp () {
    this.width *= 2
    this.xFin = this.x + this.width / 4
    this.yFin = this.y - this.width / 4
    this.arc = true
    this.rotation = QUARTER_PI
    this.xCenter = this.x
    this.yCenter = this.y - this.width / 4
    this.xCollide = this.xCenter + this.width / 2 * cos(QUARTER_PI)
    this.yCollide = this.yCenter + this.width / 2 * sin(QUARTER_PI)
    this.distance = (2 * PI * (this.width / 2)) / 4
  }

  leftDown () {
    this.width *= 2

    this.xFin = this.x + this.width / 4
    this.yFin = this.y + this.width / 4
    this.arc = true
    this.rotation = -QUARTER_PI
    this.xCenter = this.x
    this.yCenter = this.y + this.width / 4
    this.xCollide = this.xCenter + this.width / 2 * cos(-QUARTER_PI)
    this.yCollide = this.yCenter + this.width / 2 * sin(-QUARTER_PI)
    this.distance = (2 * PI * (this.width / 2)) / 4
  }

  rightUp () {
    this.width *= 2

    this.xFin = this.x - this.width / 4
    this.yFin = this.y - this.width / 4
    this.arc = true
    this.rotation = 3*QUARTER_PI
    this.xCenter = this.x
    this.yCenter = this.y - this.width / 4
    this.xCollide = this.xCenter + this.width / 2 * cos(3*QUARTER_PI)
    this.yCollide = this.yCenter + this.width / 2 * sin(3*QUARTER_PI)
    this.distance = (2 * PI * (this.width / 2)) / 4
  }

  rightDown () {
    this.width *= 2

    this.xFin = this.x - this.width / 4
    this.yFin = this.y + this.width / 4
    this.arc = true
    this.rotation = -3*QUARTER_PI
    this.xCenter = this.x
    this.yCenter = this.y + this.width / 4
    this.xCollide = this.xCenter + this.width / 2 * cos(-3*QUARTER_PI)
    this.yCollide = this.yCenter + this.width / 2 * sin(-3*QUARTER_PI)
    this.distance = (2 * PI * (this.width / 2)) / 4
  }

  upLeft () {
    this.width *= 2

    this.xFin = this.x - this.width / 4
    this.yFin = this.y + this.width / 4
    this.arc = true
    this.rotation = QUARTER_PI
    this.xCenter = this.x - this.width / 4
    this.yCenter = this.y
    this.xCollide = this.xCenter + this.width / 2 * cos(QUARTER_PI)
    this.yCollide = this.yCenter + this.width / 2 * sin(QUARTER_PI)
    this.distance = (2 * PI * (this.width / 2)) / 4
  }

  downLeft () {
    this.width *= 2

    this.xFin = this.x - this.width / 4
    this.yFin = this.y - this.width / 4
    this.arc = true
    this.rotation = -QUARTER_PI
    this.xCenter = this.x - this.width / 4
    this.yCenter = this.y
    this.xCollide = this.xCenter + this.width / 2 * cos(-QUARTER_PI)
    this.yCollide = this.yCenter + this.width / 2 * sin(-QUARTER_PI)
    this.distance = (2 * PI * (this.width / 2)) / 4
  }

  upRight () {
    this.width *= 2

    this.xFin = this.x + this.width / 4
    this.yFin = this.y + this.width / 4
    this.arc = true
    this.rotation = 3*QUARTER_PI
    this.xCenter = this.x + this.width / 4
    this.yCenter = this.y
    this.xCollide = this.xCenter + this.width / 2 * cos(3*QUARTER_PI)
    this.yCollide = this.yCenter + this.width / 2 * sin(3*QUARTER_PI)
    this.distance = (2 * PI * (this.width / 2)) / 4
  }

  downRight () {
    this.width *= 2

    this.xFin = this.x + this.width / 4
    this.yFin = this.y - this.width / 4
    this.arc = true
    this.rotation = -3*QUARTER_PI
    this.xCenter = this.x + this.width / 4
    this.yCenter = this.y
    this.xCollide = this.xCenter + this.width / 2 * cos(-3*QUARTER_PI)
    this.yCollide = this.yCenter + this.width / 2 * sin(-3*QUARTER_PI)
    this.distance = (2 * PI * (this.width / 2)) / 4
  }

  draw () {
    // let color = this.color + ''
    // if (this.intersects(mouseX, mouseY)) {
    //   this.color = 'rgba(255, 255, 0, 255)'
    // }
    this[`${this.type}Draw`]()
    // this.color = color
    if (DEBUG && false) {
      noStroke(0, 255, 0)
      fill(0, 255, 0, 50)
      ellipse(this.x, this.y, 5, 5)
      stroke(255, 0, 0)
      fill(255, 0, 0)
      ellipse(this.xFin, this.yFin, 3, 3)
      if (this.xCenter) {
        stroke(0, 0, 255)
        fill(0, 0, 255)
        ellipse(this.xCenter, this.yCenter, 4, 4)
      }
      if (this.xCollide) {
        stroke(0, 255, 255)
        fill(0, 255, 255)
        ellipse(this.xCollide, this.yCollide, 4, 4)
      }
    }
    if (!this.arc) {
      this.walls.forEach(w => {
        noStroke()
        fill(255, 0, 0)
        rect(w.x, w.y, w.w, w.h)
      })
    }
  }

  drawCarLines (x1, y1, x2, y2) {
    if (this.xCar && this.yCar && SHOW_RACE_LINE) {
      this.reverse ? stroke(255, 0, 0) : stroke(0, 0, 255)
      line(this.xCar, this.yCar, x1, y1)
      line(this.xCar, this.yCar, x2, y2)
    }
  }

  leftRightDraw () {
    noStroke()
    fill(this.color)
    rect(this.x, this.y - this.width / 2, this.width, this.width)
    this.drawCarLines(this.xCar, this.y - this.width / 2, this.xCar, this.y + this.width / 2)
  }

  rightLeftDraw () {
    noStroke()
    fill(this.color)
    rect(this.xFin, this.yFin - this.width / 2, this.width, this.width)
    this.drawCarLines(this.xCar, this.y - this.width / 2, this.xCar, this.y - this.width / 2)
  }

  upDownDraw () {
    noStroke()
    fill(this.color)
    rect(this.x - this.width / 2, this.y, this.width, this.width)
    this.drawCarLines(this.x - this.width / 2, this.yCar, this.x + this.width / 2, this.yCar)
  }

  downUpDraw () {
    noStroke()
    fill(this.color)
    rect(this.xFin - this.width / 2, this.yFin, this.width, this.width)
    this.drawCarLines(this.x - this.width / 2, this.yCar, this.x + this.width / 2, this.yCar)
  }

  getAngle (x, y) {
    return Math.atan2(y - this.yCenter, x - this.xCenter)
  }

  drawArcCar () {
    if (this.xCar && this.yCar && SHOW_RACE_LINE) {
      this.reverse ? stroke(255, 0, 0) : stroke(0, 0, 255)
      const angle = this.getAngle(this.xCar, this.yCar)
      const xCollide = this.xCenter + this.width / 2 * cos(angle)
      const yCollide = this.yCenter + this.width / 2 * sin(angle)
      line(this.xCar, this.yCar, this.xCenter, this.yCenter)
      line(this.xCar, this.yCar, xCollide, yCollide)
    }
  }

  leftUpDraw () {
    noStroke()
    fill(255, 0, 0)
    arc(this.x, this.y - this.width / 4, this.width, this.width, 0, HALF_PI)
    fill(this.color)
    arc(this.x, this.y - this.width / 4, this.width - WALL_SIZE * 2, this.width - WALL_SIZE * 2, 0, HALF_PI)
    this.drawArcCar()
  }

  leftDownDraw () {
    noStroke()
    // fill(255, 0, 0)
    // arc(this.x, this.y + this.width / 4, this.width, this.width, -HALF_PI, 0)
    fill(this.color)
    arc(this.x, this.y + this.width / 4, this.width - WALL_SIZE * 2, this.width - WALL_SIZE * 2, -HALF_PI, 0)
    this.drawArcCar()
  }

  rightUpDraw () {
    noStroke()
    fill(255, 0, 0)
    arc(this.x, this.y - this.width / 4, this.width, this.width, PI - HALF_PI, PI)
    fill(this.color)
    arc(this.x, this.y - this.width / 4, this.width - WALL_SIZE * 2, this.width - WALL_SIZE * 2, PI - HALF_PI, PI)
    this.drawArcCar()
  }

  rightDownDraw () {
    noStroke()
    fill(255, 0, 0)
    arc(this.x, this.y + this.width / 4, this.width, this.width, PI, PI + HALF_PI)
    fill(this.color)
    arc(this.x, this.y + this.width / 4, this.width - WALL_SIZE * 2, this.width - WALL_SIZE * 2, PI, PI + HALF_PI)
    this.drawArcCar()
  }

  upLeftDraw () {
    noStroke()
    fill(255, 0, 0)
    arc(this.x - this.width / 4, this.y, this.width, this.width, 0, HALF_PI)
    fill(this.color)
    arc(this.x - this.width / 4, this.y, this.width - WALL_SIZE * 2, this.width - WALL_SIZE * 2, 0, HALF_PI)
    this.drawArcCar()
  }

  downLeftDraw () {
    noStroke()
    fill(255, 0, 0)
    arc(this.x - this.width / 4, this.y, this.width, this.width, -HALF_PI, 0)
    fill(this.color)
    arc(this.x - this.width / 4, this.y, (this.width - WALL_SIZE) * 2, (this.width - WALL_SIZE) * 2, -HALF_PI, 0)
    this.drawArcCar()
  }

  upRightDraw () {
    noStroke()
    fill(255, 0, 0)
    arc(this.x + this.width / 4, this.y, this.width, this.width, PI - HALF_PI, PI)
    fill(this.color)
    arc(this.x + this.width / 4, this.y, this.width - WALL_SIZE * 2, this.width - WALL_SIZE * 2, PI - HALF_PI, PI)
    this.drawArcCar()
  }

  downRightDraw () {
    noStroke()
    fill(255, 0, 0)
    arc(this.x + this.width / 4, this.y, this.width, this.width, PI, PI + HALF_PI)
    fill(this.color)
    arc(this.x + this.width / 4, this.y, this.width - WALL_SIZE * 2, this.width - WALL_SIZE * 2, PI, PI + HALF_PI)
    this.drawArcCar()
  }

  splitType () {
    const reg = /^([^A-Z]+)(.*$)/
    const debut = this.type.replace(reg, '$1')
    const fin = this.type.replace(reg, '$2').toLowerCase()
    return {
      debut,
      fin
    }
  }
}
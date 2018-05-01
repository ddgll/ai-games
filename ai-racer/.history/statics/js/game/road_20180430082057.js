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
    this.height = options && options.height || DEFAULT_ROAD_WIDTH
    this.type = type
    this.debut = null
    this.fin = null
    this.number = TYPES_STRING.indexOf(type)
    this.arc = false
    this.rect = false
    this.color = options && options.color || 'rgba(176, 176, 176, 1)'
    if (typeof this[this.type] === 'function') {
      this[this.type]()
    } else {
      console.log(this)
      throw ('Unknown road type', this.type)
    }
    this.splitType(type)
    this.isHorizontal()
    this.isVertical()
    this.isStraight()
  }

  contains (x, y) {
    if (this.arc !== false) {
      return collidePointArc(x, y, this.xCenter, this.yCenter, this.width / 2 - WALL_SIZE, this.rotation, HALF_PI)
    } else if (this.rect !== false) {
      return collidePointRect(x, y, this.rect.x, this.rect.y, this.rect.w, this.rect.h)
    }
    return false
  }

  collide (x, y) {
    if (this.contains(x, y)) return false
    if (this.arc !== false) {
      return collidePointArc(x, y, this.xCenter, this.yCenter, this.width / 2 + WALL_SIZE, this.rotation, HALF_PI)
    } else if (this.rect !== false) {
      return collidePointRect(x, y, this.wall.x, this.wall.y, this.wall.w, this.wall.h)
      if (x2 !== undefined && y2 !== undefined && this.walls && this.walls.length) {
        for (let wall of this.walls) {
          if (collideLineLine(x, y, x2, y2, this.wall.x, this.wall.y, this.wall.w, this.wall.h)) {
            return true
          }
        }
        return collideLineLine(x, y, x2, y2, this.wall.x, this.wall.y, this.wall.w, this.wall.h)
      } else {
        
      }
    }
    return false
  }

  collideLine(x, y, x1, x2) {
    if (this.arc !== false) {

    } else if (this.rect !== false) {
      for (let wall of this.walls) {
        if (collideLineLine(x, y, x2, y2, wall.x, wall.y, wall.w, wall.h)) {
          return true
        }
      }
    }
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
      return collidePointRect(road.xFin, road.yFin, this.xCenter - this.width / 2, this.yCenter - this.width / 2, this.width, this.height) ||
              collidePointRect(road.xFin, road.yFin, this.wall.x, this.wall.y, this.wall.w, this.wall.h)
    }
  }

  adjacent (road) {
    if (road.xFin == this.x && road.yFin == this.y) return true
    if (road.x == this.xFin && road.y == this.yFin) return true
    return false
  }

  rightLeft () {
    this.wall = { x: this.x - this.width, y: this.y - this.width / 2, w: this.width, h: this.height }
    this.wallLines = [
      { x1: this.x - this.width, y1: this.y - this.height / 2 + WALL_SIZE, x2: this.x, y2: this.y - this.height / 2 + WALL_SIZE },
      { x1: this.x - this.width, y1: this.y + this.height / 2 - WALL_SIZE, x2: this.x, y2: this.y + this.height / 2 - WALL_SIZE }
    ]
    this.height -= WALL_SIZE * 2
    this.xFin = this.x - this.width
    this.yFin = this.y
    this.xCenter = this.x - this.width / 2
    this.yCenter = this.y
    this.distance = this.width
    this.rect = { x: this.xFin, y: this.yFin - this.height / 2, w: this.width, h: this.height }
  }

  leftRight () {
    this.wall = { x: this.x, y: this.y - this.width / 2, w: this.width, h: this.height }
    this.wallLines = [
      { x1: this.x, y1: this.y - this.height / 2 + WALL_SIZE, x2: this.x + this.width, y2: this.y - this.height / 2 + WALL_SIZE },
      { x1: this.x, y1: this.y + this.height / 2 - WALL_SIZE, x2: this.x + this.width, y2: this.y + this.height / 2 - WALL_SIZE }
    ]
    this.height -= WALL_SIZE * 2
    this.xFin = this.x + this.width
    this.yFin = this.y
    this.xCenter = this.x + this.width / 2
    this.yCenter = this.y
    this.distance = this.width
    this.rect = { x: this.x, y: this.y - this.height / 2, w: this.width, h: this.height }
  }

  upDown () {
    this.wall = { x: this.x - this.width / 2, y: this.y, w: this.width, h: this.height }
    this.wallLines = [
      { x1: this.x - this.width / 2 + WALL_SIZE, y1: this.y, x2: this.x - this.width / 2 + WALL_SIZE, y2: this.y + this.height },
      { x1: this.x + this.width / 2 - WALL_SIZE, y1: this.y, x2: this.x + this.width / 2 - WALL_SIZE, y2: this.y + this.height }
    ]
    this.width -= WALL_SIZE * 2
    this.xFin = this.x
    this.yFin = this.y + this.height
    this.xCenter = this.x
    this.yCenter = this.y + this.height / 2
    this.distance = this.height
    this.rect = { x: this.x - this.width / 2, y: this.y, w: this.width, h: this.height }
  }

  downUp () {
    this.wall = { x: this.x - this.width / 2, y: this.y - this.width, w: this.width, h: this.height }
    this.wallLines = [
      { x1: this.x - this.width / 2 + WALL_SIZE, y1: this.y - this.height, x2: this.x - this.width / 2 + WALL_SIZE, y2: this.y },
      { x1: this.x + this.width / 2 - WALL_SIZE, y1: this.y - this.height, x2: this.x + this.width / 2 - WALL_SIZE, y2: this.y }
    ]
    this.width -= WALL_SIZE * 2
    this.xFin = this.x
    this.yFin = this.y - this.height
    this.xCenter = this.x
    this.yCenter = this.y - this.height / 2
    this.distance = this.height
    this.rect = { x: this.xFin - this.width / 2, y: this.yFin, w: this.width, h: this.height }
  }

  leftUp () {
    this.height = this.width *= 2
    this.wall = { x: this.x, y: this.y - this.width / 4, w: this.width, h: this.height, a1: 0, a2: HALF_PI }
    this.xFin = this.x + this.width / 4
    this.yFin = this.y - this.width / 4
    this.rotation = QUARTER_PI
    this.xCenter = this.x
    this.yCenter = this.y - this.width / 4
    this.xCollide = this.xCenter + this.width / 2 * cos(QUARTER_PI)
    this.yCollide = this.yCenter + this.width / 2 * sin(QUARTER_PI)
    this.distance = (2 * PI * ((this.width - WALL_SIZE * 2) / 2)) / 4
    this.arc = { x: this.x, y: this.y - this.width / 4, w: this.width - WALL_SIZE * 2, h: this.height - WALL_SIZE * 2, a1: 0, a2: HALF_PI }
  }

  leftDown () {
    this.height = this.width *= 2
    this.wall = { x: this.x, y: this.y + this.width / 4, w: this.width, h: this.height, a1: -HALF_PI, a2: 0 }
    this.arc = { x: this.x, y: this.y + this.width / 4, w: this.width - WALL_SIZE * 2, h: this.height - WALL_SIZE * 2, a1: -HALF_PI, a2: 0 }
    this.xFin = this.x + this.width / 4
    this.yFin = this.y + this.width / 4
    this.rotation = -QUARTER_PI
    this.xCenter = this.x
    this.yCenter = this.y + this.width / 4
    this.xCollide = this.xCenter + this.width / 2 * cos(-QUARTER_PI)
    this.yCollide = this.yCenter + this.width / 2 * sin(-QUARTER_PI)
    this.distance = (2 * PI * ((this.width - WALL_SIZE * 2) / 2)) / 4
  }

  rightUp () {
    this.height = this.width *= 2
    this.wall = { x: this.x, y: this.y - this.width / 4, w: this.width, h: this.height, a1: PI - HALF_PI, a2: PI }
    this.arc = { x: this.x, y: this.y - this.width / 4, w: this.width - WALL_SIZE * 2, h: this.height - WALL_SIZE * 2, a1: PI - HALF_PI, a2: PI }
    this.xFin = this.x - this.width / 4
    this.yFin = this.y - this.width / 4
    this.rotation = 3*QUARTER_PI
    this.xCenter = this.x
    this.yCenter = this.y - this.width / 4
    this.xCollide = this.xCenter + this.width / 2 * cos(3*QUARTER_PI)
    this.yCollide = this.yCenter + this.width / 2 * sin(3*QUARTER_PI)
    this.distance = (2 * PI * ((this.width - WALL_SIZE * 2) / 2)) / 4
  }

  rightDown () {
    this.height = this.width *= 2
    this.wall = { x: this.x, y: this.y + this.width / 4, w: this.width, h: this.height, a1: PI, a2: PI + HALF_PI }
    this.arc = { x: this.x, y: this.y + this.width / 4, w: this.width - WALL_SIZE * 2, h: this.height - WALL_SIZE * 2, a1: PI, a2: PI + HALF_PI }
    this.xFin = this.x - this.width / 4
    this.yFin = this.y + this.width / 4
    this.rotation = -3*QUARTER_PI
    this.xCenter = this.x
    this.yCenter = this.y + this.width / 4
    this.xCollide = this.xCenter + this.width / 2 * cos(-3*QUARTER_PI)
    this.yCollide = this.yCenter + this.width / 2 * sin(-3*QUARTER_PI)
    this.distance = (2 * PI * ((this.width - WALL_SIZE * 2) / 2)) / 4
  }

  upLeft () {
    this.height = this.width *= 2
    this.wall = { x: this.x - this.width / 4, y: this.y, w: this.width, h: this.height, a1: 0, a2: HALF_PI }
    this.arc = { x: this.x - this.width / 4, y: this.y, w: this.width - WALL_SIZE * 2, h: this.height - WALL_SIZE * 2, a1: 0, a2: HALF_PI }
    this.xFin = this.x - this.width / 4
    this.yFin = this.y + this.width / 4
    this.rotation = QUARTER_PI
    this.xCenter = this.x - this.width / 4
    this.yCenter = this.y
    this.xCollide = this.xCenter + this.width / 2 * cos(QUARTER_PI)
    this.yCollide = this.yCenter + this.width / 2 * sin(QUARTER_PI)
    this.distance = (2 * PI * ((this.width - WALL_SIZE * 2) / 2)) / 4
  }

  downLeft () {
    this.height = this.width *= 2
    this.wall = { x: this.x - this.width / 4, y: this.y, w: this.width, h: this.height, a1: -HALF_PI, a2: 0 }
    this.arc = { x: this.x - this.width / 4, y: this.y, w: this.width - WALL_SIZE * 2, h: this.height - WALL_SIZE * 2, a1: -HALF_PI, a2: 0 }
    this.xFin = this.x - this.width / 4
    this.yFin = this.y - this.width / 4
    this.rotation = -QUARTER_PI
    this.xCenter = this.x - this.width / 4
    this.yCenter = this.y
    this.xCollide = this.xCenter + this.width / 2 * cos(-QUARTER_PI)
    this.yCollide = this.yCenter + this.width / 2 * sin(-QUARTER_PI)
    this.distance = (2 * PI * ((this.width - WALL_SIZE * 2) / 2)) / 4
  }

  upRight () {
    this.height = this.width *= 2
    this.wall = { x: this.x + this.width / 4, y: this.y, w: this.width, h: this.height, a1: PI - HALF_PI, a2: PI }
    this.arc = { x: this.x + this.width / 4, y: this.y, w: this.width - WALL_SIZE * 2, h: this.height - WALL_SIZE * 2, a1: PI - HALF_PI, a2: PI }
    this.xFin = this.x + this.width / 4
    this.yFin = this.y + this.width / 4
    this.rotation = 3*QUARTER_PI
    this.xCenter = this.x + this.width / 4
    this.yCenter = this.y
    this.xCollide = this.xCenter + this.width / 2 * cos(3*QUARTER_PI)
    this.yCollide = this.yCenter + this.width / 2 * sin(3*QUARTER_PI)
    this.distance = (2 * PI * ((this.width - WALL_SIZE * 2) / 2)) / 4
  }

  downRight () {
    this.height = this.width *= 2
    this.wall = { x: this.x + this.width / 4, y: this.y, w: this.width, h: this.height, a1: PI, a2: PI + HALF_PI }
    this.arc = { x: this.x + this.width / 4, y: this.y, w: this.width - WALL_SIZE * 2, h: this.height - WALL_SIZE * 2, a1: PI, a2: PI + HALF_PI }
    this.xFin = this.x + this.width / 4
    this.yFin = this.y - this.width / 4
    this.rotation = -3*QUARTER_PI
    this.xCenter = this.x + this.width / 4
    this.yCenter = this.y
    this.xCollide = this.xCenter + this.width / 2 * cos(-3*QUARTER_PI)
    this.yCollide = this.yCenter + this.width / 2 * sin(-3*QUARTER_PI)
    this.distance = (2 * PI * ((this.width - WALL_SIZE * 2) / 2)) / 4
  }

  draw () {
    noStroke()
    if (this.rect !== false) {
      fill(255, 0, 0)
      rect(this.wall.x, this.wall.y, this.wall.w, this.wall.h)
      fill(this.color)
      rect(this.rect.x, this.rect.y, this.rect.w, this.rect.h)
    } else if (this.arc !== false) {
      fill(255, 0, 0)
      arc(this.wall.x, this.wall.y, this.wall.w, this.wall.h, this.wall.a1, this.wall.a2)
      fill(this.color)
      arc(this.arc.x, this.arc.y, this.arc.w, this.arc.h, this.arc.a1, this.arc.a2)
    }
    if (DEBUG) {
      noStroke(0, 255, 0)
      fill(0, 255, 0)
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
      if (this.wallLines && this.wallLines.length) {
        console.log(this.wallLine)
        stroke(255, 255, 0)
        strokeWeight(1)
        this.wallLines.forEach(l => {
          line(l.x1, l.y1, l.x2, l.y2)
        })
      }
    }
  }

  getNormalizedPosition(x, y) {
    if (this.horizontal) return { x, y: this.y }
    if (this.vertical) return { x: this.x, y }
    if (this.arc) {
      const angle = this.getAngle(x, y)
      const dist = this.width / 4
      const xCollide = this.xCenter + dist * cos(angle)
      const yCollide = this.yCenter + dist * sin(angle)
      return { x: xCollide, y: yCollide }
    }
  }

  getAngle (x, y) {
    return Math.atan2(y - this.yCenter, x - this.xCenter)
  }

  splitType () {
    const reg = /^([^A-Z]+)(.*$)/
    this.debut = this.type.replace(reg, '$1')
    this.fin = this.type.replace(reg, '$2').toLowerCase()
    return {
      debut: this.debut,
      fin: this.fin
    }
  }

  isStraight () {
    this.straight = (this.type == 'leftRight' || this.type == 'rightLeft' || this.type == 'upDown' || this.type == 'downUp')
    return this.straight
  }

  isHorizontal () {
    this.horizontal = (this.type == 'leftRight' || this.type == 'rightLeft')
    return this.horizontal
  }

  isVertical () {
    this.vertical = (this.type == 'upDown' || this.type == 'downUp')
    return this.vertical
  }
}
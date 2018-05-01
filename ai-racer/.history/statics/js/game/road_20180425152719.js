class Road {
  constructor (x, y, type, options) {
    this.id = this.uuid()
    this.x = x
    this.y = y
    this.distance = 0
    this.rotation = 0
    this.fade = 50
    this.length = options && options.length || DEFAULT_ROAD_LENGTH
    this.width = options && options.width || DEFAULT_ROAD_WIDTH
    this.type = type
    this.arc = false
    this.color = options && options.color || 'rgba(255, 255, 255, 0.25)'
    if (typeof this[this.type] === 'function' && typeof this[`${this.type}Draw`] === 'function') {
      this[this.type]()
    } else {
      throw ('Unknown road type', this.type)
    }
  }

  uuid () {
    let d = new Date().getTime()
    if(window.performance && typeof window.performance.now === "function") d += performance.now()
    let uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      let r = (d + Math.random()*16)%16 | 0
      d = Math.floor(d/16)
      return (c=='x' ? r : (r&0x3|0x8)).toString(16)
    })
    return uuid
  }

  intersects (x, y) {
    if (this.arc) {
      return collidePointArc(x, y, this.xCenter, this.yCenter, this.length / 2, this.rotation, HALF_PI)
    } else {
      return collidePointRect(x, y, this.xCenter - this.length / 2, this.yCenter - this.width / 2, this.length, this.width)
    }
  }

  rightLeft () {
    this.xFin = this.x - this.length
    this.yFin = this.y
    this.xCenter = this.x - this.length / 2
    this.yCenter = this.y
    this.distance = this.length
  }

  leftRight () {
    this.xFin = this.x + this.length
    this.yFin = this.y
    this.xCenter = this.x + this.length / 2
    this.yCenter = this.y
    this.distance = this.length
  }

  upDown () {
    this.xFin = this.x
    this.yFin = this.y + this.width
    this.xCenter = this.x
    this.yCenter = this.y + this.width / 2
    this.distance = this.length
  }

  downUp () {
    this.xFin = this.x
    this.yFin = this.y - this.width
    this.xCenter = this.x
    this.yCenter = this.y - this.width / 2
    this.distance = (2 * PI * (this.length / 2)) / 4
  }

  leftUp () {
    this.width *= 2
    this.length *= 2
    this.xFin = this.x + this.length / 4
    this.yFin = this.y - this.width / 4
    this.arc = true
    this.rotation = QUARTER_PI
    this.xCenter = this.x
    this.yCenter = this.y - this.width / 4
    this.distance = (2 * PI * (this.length / 2)) / 4
  }

  leftDown () {
    this.width *= 2
    this.length *= 2
    this.xFin = this.x + this.length / 4
    this.yFin = this.y + this.width / 4
    this.arc = true
    this.rotation = -QUARTER_PI
    this.xCenter = this.x
    this.yCenter = this.y + this.width / 4
    this.distance = (2 * PI * (this.length / 2)) / 4
  }

  rightUp () {
    this.width *= 2
    this.length *= 2
    this.xFin = this.x - this.length / 4
    this.yFin = this.y - this.width / 4
    this.arc = true
    this.xCenter = this.x
    this.yCenter = this.y - this.width / 4
    this.distance = (2 * PI * (this.length / 2)) / 4
  }

  rightDown () {
    this.width *= 2
    this.length *= 2
    this.xFin = this.x - this.length / 4
    this.yFin = this.y + this.width / 4
    this.arc = true
    this.xCenter = this.x
    this.yCenter = this.y + this.width / 4
    this.distance = (2 * PI * (this.length / 2)) / 4
  }

  upLeft () {
    this.width *= 2
    this.length *= 2
    this.xFin = this.x - this.length / 4
    this.yFin = this.y + this.width / 4
    this.arc = true
    this.xCenter = this.x - this.length / 4
    this.yCenter = this.y
    this.distance = (2 * PI * (this.length / 2)) / 4
  }

  downLeft () {
    this.width *= 2
    this.length *= 2
    this.xFin = this.x - this.length / 4
    this.yFin = this.y - this.width / 4
    this.arc = true
    this.xCenter = this.x - this.length / 4
    this.yCenter = this.y
    this.distance = (2 * PI * (this.length / 2)) / 4
  }

  upRight () {
    this.width *= 2
    this.length *= 2
    this.xFin = this.x + this.length / 4
    this.yFin = this.y + this.width / 4
    this.arc = true
    this.xCenter = this.x + this.length / 4
    this.yCenter = this.y
    this.distance = (2 * PI * (this.length / 2)) / 4
  }

  downRight () {
    this.width *= 2
    this.length *= 2
    this.xFin = this.x + this.length / 4
    this.yFin = this.y - this.width / 4
    this.arc = true
    this.xCenter = this.x + this.length / 4
    this.yCenter = this.y
    this.distance = (2 * PI * (this.length / 2)) / 4
  }

  draw () {
    let color = this.color + ''
    if (this.intersects(mouseX, mouseY)) {
      this.color = 'rgba(255, 255, 0, 255)'
    }
    this[`${this.type}Draw`]()
    this.color = color
    if (DEBUG) {
      stroke(0, 255, 0)
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
    }
  }

  leftRightDraw () {
    stroke(this.color)
    fill(this.color)
    rect(this.x, this.y - this.width / 2, this.length, this.width)
    stroke(255, 0, 0)
    line(this.x, this.y - this.width / 2, this.x + this.length, this.y - this.width / 2)
    line(this.x, this.y + this.width / 2, this.x + this.length, this.y + this.width / 2)
  }

  rightLeftDraw () {
    stroke(this.color)
    fill(this.color)
    rect(this.xFin, this.yFin - this.width / 2, this.length, this.width)
    stroke(255, 0, 0)
    line(this.xFin, this.yFin - this.width / 2, this.xFin + this.length, this.yFin - this.width / 2)
    line(this.xFin, this.yFin + this.width / 2, this.xFin + this.length, this.yFin + this.width / 2)
  }

  upDownDraw () {
    stroke(this.color)
    fill(this.color)
    rect(this.x - this.length / 2, this.y, this.length, this.width)
    stroke(255, 0, 0)
    line(this.x - this.length / 2, this.y, this.x - this.length / 2, this.y + this.width)
    line(this.x + this.length / 2, this.y, this.x + this.length / 2, this.y + this.width)
  }

  downUpDraw () {
    stroke(this.color)
    fill(this.color)
    rect(this.xFin - this.length / 2, this.yFin, this.length, this.width)
    stroke(255, 0, 0)
    line(this.xFin - this.length / 2, this.yFin, this.xFin - this.length / 2, this.yFin + this.width)
    line(this.xFin + this.length / 2, this.yFin, this.xFin + this.length / 2, this.yFin + this.width)
  }

  leftUpDraw () {
    stroke(255, 0, 0)
    fill(this.color)
    arc(this.x, this.y - this.width / 4, this.length, this.width, 0, HALF_PI);
  }

  leftDownDraw () {
    stroke(255, 0, 0)
    fill(this.color)
    arc(this.x, this.y + this.width / 4, this.length, this.width, -HALF_PI, 0);
  }

  rightUpDraw () {
    stroke(255, 0, 0)
    fill(this.color)
    arc(this.x, this.y - this.width / 4, this.length, this.width, PI - HALF_PI, PI);
  }

  rightDownDraw () {
    stroke(255, 0, 0)
    fill(this.color)
    arc(this.x, this.y + this.width / 4, this.length, this.width, PI, PI + HALF_PI);
  }

  upLeftDraw () {
    stroke(255, 0, 0)
    fill(this.color)
    arc(this.x - this.length / 4, this.y, this.length, this.width, 0, HALF_PI);
  }

  downLeftDraw () {
    stroke(255, 0, 0)
    fill(this.color)
    arc(this.x - this.length / 4, this.y, this.length, this.width, -HALF_PI, 0);
  }

  upRightDraw () {
    stroke(255, 0, 0)
    fill(this.color)
    arc(this.x + this.length / 4, this.y, this.length, this.width, PI - HALF_PI, PI);
  }

  downRightDraw () {
    stroke(255, 0, 0)
    fill(this.color)
    arc(this.x + this.length / 4, this.y, this.length, this.width, PI, PI + HALF_PI);
  }
}
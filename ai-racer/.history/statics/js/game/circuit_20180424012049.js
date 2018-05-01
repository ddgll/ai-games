class Circuit {
  constructor (x, y, size) {
    this.x = x
    this.y = y
    this.size = size || DEFAULT_CIRCUIT_SIZE
    this.roads = []
    this.createRoads()
  }

  createRoads () {
    let x = this.x
    let y = this.y
    for (let i = 0, r; i < this.size; i++) {
      r = new Road(x, y, 'horizontal')
      this.roads.push(r)
      x = r.xFin
      y = r.yFin
    }
  }

  getLastRoad () {
    if (!this.roads.length) return { x: this.x, y: this.y }
    const road = this.roads[this.roads.length - 1]
    return {
      x: road.xFin,
      y: road.yFin
    }
  }

  getNextType () {
    return 'horizontal'
  }

  isClosed () {
    const last = this.getLastRoad()
    if (last.x === this.x && last.y === this.y) {
      return true
    }
    return false
  }

  isDead () {
    return this.roads.length === this.size && !this.isClosed()
  }

  draw () {
    console.log('tt', this.roads)
    if (this.roads.length < this.size) {
      const last = this.getLastXy
      this.roads.push(last.x, last.y, this.getNextType())
    }
    this.roads.forEach(road => road.draw())
  }
}
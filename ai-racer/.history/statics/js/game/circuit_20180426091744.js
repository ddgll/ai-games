const TYPES_STRING = [
  'upDown',
  'downUp',
  'leftRight',
  'rightLeft',
  'leftUp',
  'leftDown',
  'rightUp',
  'rightDown',
  'upLeft',
  'downLeft',
  'upRight',
  'downRight'
]

const DIR_STRING = [
  'none',
  'right',
  'left'
]

class Circuit {
  constructor (x, y, size, brain_, isBest) {
    this.x = x
    this.y = y
    this.dead = false
    this.score = 48 * (size - DEFAULT_CIRCUIT_SIZE)
    this.frames = 0
    this.fitness = 0
    this.best = isBest
    this.first = false
    this.size = size || DEFAULT_CIRCUIT_SIZE
    this.roads = []
    this.brain = brain_
    this.setBounds()
  }

  setBounds () {
    const sizeX = this.size * DEFAULT_ROAD_LENGTH
    const sizeY = this.size * DEFAULT_ROAD_LENGTH / 2
    const midX = sizeX / 2
    const midY = sizeY / 2
    this.bounds = {
      xmin: Math.floor(sizeX / 2),
      ymin: this.y - DEFAULT_ROAD_LENGTH * 1.5,
      xmax: this.x + midX + DEFAULT_ROAD_LENGTH * 0.5,
      ymax: this.y + midY + DEFAULT_ROAD_LENGTH * 0.5,
      width: sizeX,
      height: sizeY
    }
  }

  getLastRoad () {
    if (!this.roads.length) return { x: this.x, y: this.y }
    const road = this.roads[this.roads.length - 1]
    return {
      x: road.xFin,
      y: road.yFin,
      type: road.type,
      arc: road.arc
    }
  }

  oneHotEncode(type){
    const zeros = Array.apply(null, Array(TYPES_STRING.length)).map(Number.prototype.valueOf, 0);
    const index = TYPES_STRING.indexOf(type);
    zeros[index] = 1;
    return zeros;
  }

  oneHotDecode(zeros){
    const max = Math.max.apply(null, zeros);
    const index = zeros.indexOf(max);
    return TYPES_STRING[index];
  }

  isClosed () {
    const last = this.getLastRoad()
    return (last.type && last.x === this.x && last.y === this.y)
  }

  isStraight (debut, fin) {
    return (debut !== 'left' && debut !== 'right' && fin !== 'left' && fin !== 'right')
  }

  splitType (type) {
    const reg = /^([^A-Z]+)(.*$)/
    const debut = road.type.replace(reg, '$1')
    const fin = road.type.replace(reg, '$2').toLowerCase()
    return {
      debut,
      fin
    }
  }

  isInverse(type1, type2) {
    switch (type1) {
      case 'up':
        return type2 === 'down'
      case 'down':
        return type2 === 'up'
      case 'left':
        return type2 === 'right'
      case 'right':
        return type2 === 'left'
    }
  }

  getInverse(type) {
    switch (type) {
      case 'up':
        return 'down'
      case 'down':
        return 'up'
      case 'left':
        return 'right'
      case 'right':
        return 'left'
    }
  }

  calculateFitness (maxscore, minscore) {
    let score = 0
    for (let i = 0, l = this.size - 1; i < l; i++) {
      const first = this.roads[i]
      const second = this.roads[i + 1]
      const fType = this.splitType(first)
      const sType = this.splitType(first)
    }
    const dist = distance(this.x, this.y, last.x, last.y)
    this.fitness = this.score - dist
    // console.log('fff', this.normalizedScore, this.score, maxscore, minscore, this.roads.length)
    return this.fitness
  }

  update () {
  }

  addRoad (dir) {
    let next, inverse
    if (this.roads.length === 0) {
      inverse = 'left'
    } else {
      const last = this.getLastRoad()
      const type = this.splitType(last.type)
      const inverse = this.getInverse(type.fin)
    }
    const next = getNextDirection(inverse, dir)
    this.roads.push(this.x, this.y, `${inverse}${next}`)
  }

  offBounds (road) {
    return (road.xFin - DEFAULT_ROAD_LENGTH < this.bounds.xmin || 
      road.xFin + DEFAULT_ROAD_LENGTH > this.bounds.xmax || 
      road.yFin - DEFAULT_ROAD_LENGTH < this.bounds.ymin || 
      road.yFin + DEFAULT_ROAD_LENGTH > this.bounds.ymax)
  }

  errors (road) {
    for (let i = 1, l = this.size - 1, r; i < l; i++) {
      r = this.roads[i]
      // Reach end
      if (road.xFin === begin.x && road.yFin === begin.y) return true
      // Intersect other
      if (r.intersects(road.xFin, road.yFin)) return true
    }
    return false
  }

  copyRoads (roads) {
    this.roads = []
    roads.forEach(r => {
      const last = this.getLastRoad()
      this.roads.push(new Road(last.x, last.y, r.type))
    })
  }

  draw () {
    if (this.dead) return
    this.roads.forEach(road => road.draw())
    stroke(255, 0, 0)
    noFill()
    rect(this.bounds.xmin, this.bounds.ymin, this.bounds.width, this.bounds.height)
  }

  serialize (line) {
    str = line || ''
    this.roads.forEach(road => {
      if (str.length && str !== line) str += "-"
      str += `${road.type}`
    })
    return 'Length: ' + this.roads.length + ' => ' + str
  }
}
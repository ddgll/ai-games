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
  constructor (x, y, size, dna_, isBest, isTest) {
    this.id = uuid()
    this.x = x
    this.y = y
    this.dead = false
    this.score = 0
    this.frames = 0
    this.fitness = 0
    this.best = isBest
    this.test = isTest
    this.win = false
    this.first = false
    this.lastGoodIndex = 0
    this.size = size || DEFAULT_CIRCUIT_SIZE
    this.roads = []
    if (dna_ && dna_.length === this.size) {
      console.log(dna_)
      this.dna = dna_.slice()
    } else if (!this.test) {
      this.dna = this.createRandom()
    }
  }

  createRandom () {
    const dna = []
    for (let i = 0, l = this.size; i < l; i++) {
      dna.push(Math.floor(random(3)))
    }
    return dna
  }

  roadsFromDna () {
    for (let i = 0, l = this.dna.length; i < l; i++) {
      this.addRoad(DIR_STRING[this.dna[i]])
    }
    this.calculateFitness()
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
    const debut = type.replace(reg, '$1')
    const fin = type.replace(reg, '$2').toLowerCase()
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

  calculateFitness () {
    this.fitness = 0
    const length = this.roads.length
    let score = 0, dead = false
    let last
    for (let i = 0; i < length; i++) {
      last = this.roads[i]
      if (this.errors(last, i)) {
        dead = true
        break
      }
      this.lastGoodIndex = i
      score += DEFAULT_ROAD_WIDTH
    }
    const dist = last ? distance(this.x, this.y, last.xFin, last.yFin) : 1
    if (!dead && length === this.size) {
      if (this.isClosed()) {
        this.win = true
        score *= 2
      } else {
        score -= dist
        dead = true
      }
    } else {
      score -= dist
    }
    this.fitness = score
    if (isNaN(this.fitness)) {
      console.error('=============================')
      console.error('Fitness', this.fitness)
      console.error('Dist', dist)
      console.error('Score', score)
      console.error('Dead', dead)
      console.error('Win', this.win)
      console.error('Reste', this.size - this.roads.length)
      console.error('=============================')
    }
    if (this.test) {
      console.log('=============================')
      console.log('Fitness', this.fitness)
      console.log('Dist', dist)
      console.log('Score', score)
      console.log('Dead', dead)
      console.log('Win', this.win)
      console.log('Last Good Index', this.lastGoodIndex)
      console.log('Reste', this.size - this.roads.length)
      console.log('=============================')
    }
    this.score = score
    this.dead = dead
    return this.fitness
  }

  checkPoint (x, y) {
    for (let i = 0, l = this.roads.length, r; i < l; i++) {
      r = this.roads[i]
      if (r.contains(x, y)) return true
    }
    return false
  }

  getRoad (x, y) {
    for (let i = 0, l = this.roads.length, r; i < l; i++) {
      r = this.roads[i]
      if (r.contains(x, y)) return r
    }
    return false
  }

  checkCar (car) {
    const x = car.position.x
    const y = car.position.y
    let road, found
    for (let i = 0, l = this.roads.length; i < l; i++) {
      road = this.roads[i]
      if (road.collide(x, y)) car.crash()
      if (road.contains(x, y)) found = road
    }
    if (found) this.checkDistance(found, car)
  }

  checkDistance (found, car) {
    if (!car || !car.position || !car.oldPosition) return false
    const x = car.position.x
    const y = car.position.y
    const xOld = car.oldPosition.x
    const yOld = car.oldPosition.y
    const dist1 = distance(found.xFin, found.yFin, x, y)
    const dist2 = distance(found.xFin, found.yFin, xOld, yOld)
    if (dist1 > (dist2 + 2)) {
      car.reverse = true
    } else {
      car.reverse = false
    }
  }

  addRoad (dir) {
    if (this.roads.length === this.size) return
    let inverse = 'left'
    const last = this.getLastRoad()
    if (last.type) {
      const type = this.splitType(last.type)
      inverse = this.getInverse(type.fin)
    }
    const next = getNextDirection(inverse, dir)
    this.roads.push(new Road(last.x, last.y, `${inverse}${next}`))
  }

  errors (road, index) {
    if (this.roads.length < 2) return false
    for (let i = 1, l = this.roads.length - 1, r; i < l; i++) {
      r = this.roads[i]
      // Reach end
      if (index < l && road.xFin === this.x && road.yFin === this.y) {
        if (this.test) console.log('Reach end :\'(')
        return true
      }
      // Intersect other
      if (r.id !== road.id && !r.adjacent(road) && r.intersects(road)) {
        r.color = 'rgba(255, 0, 0, 255)'
        road.color = 'rgba(255, 255, 0, 255)'
        if (this.test) console.log('Intersect other :\'(', road, r)
        return true
      }
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
    // if (this.dead) return
    this.roads.forEach((road, index) => {
      if (index <= this.lastGoodIndex) road.draw()
      if (index > this.lastGoodIndex && (this.test || this.best)) {
        road.draw()
      }
    })
    stroke(0, 255, 0)
    fill(0, 255, 0, 50)
    ellipse(this.x, this.y, 5, 5)
    // stroke(0, 255, 0)
    // fill(0, 255, 0, 50)
    // ellipse(this.x, this.y, 5, 5)
    // stroke(255, 0, 0)
    // noFill()
    // rect(this.bounds.xmin, this.bounds.ymin, this.bounds.xmax - this.bounds.xmin, this.bounds.ymax - this.bounds.ymin)
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
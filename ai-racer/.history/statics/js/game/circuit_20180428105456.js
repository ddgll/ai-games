const ROADS_DIRECTIONS_STRING = [
  'up',
  'upRight',
  'downRight',
  'down',
  'downLeft',
  'upLeft'
]

class Circuit {
  constructor (x, y, dna_, options) {
    this.x = x
    this.y = y
    this.dead = false
    this.win = false
    this.first = false
    this.score = 0
    this.fitness = 0
    this.best = options && options.best ? options.best : false
    this.test = options && options.test ? options.test : false
    this.size = options && options.size ? options.size : 10
    this.width = options && options.width ? options.width : 200
    this.height = options && options.height ? options.height : 200
    this.roadsSize = options && options.roadsSize ? options.roadsSize : 20
    this.roadsSides = options && options.roadsSides ? options.roadsSides : 6
    this.roadsWidth = Math.sqrt(3) * this.roadsSize
    this.walls = []
    if (dna_ && dna_.length === this.size) {
      this.dna = dna_.slice()
    } else if (!this.test) {
      this.dna = this.createRandomDna()
    }
    this.body = this.createWalls()
  }

  createWalls () {
    let row = 0, y = this.y
    while (y + this.roadsWidth <= this.height) {
      let col = 0, offset = this.x
      if (row % 2 == 1) {
        offset = (this.roadsWidth - this.roadsSize) / 2 + this.roadsSize
        col = 1
      }
      let x = offset
      while ( x + this.roadsWidth <= this.width) {
        let r = new Road(x, y, true)
        this.walls.push(r)
        col += 2
        x += this.roadsWidth + this.roadsSize
      }
      row++
      y += this.roadsWidth / 2
    }
    const bodies = this.walls.map(w => w.body)
    console.log(bodies)
    return Body.create({ parts: bodies })
  }

  createRandomDna () {
    const dna = []
    const nbDirections = ROADS_DIRECTIONS_STRING.length
    for (let i = 0, l = this.size; i < l; i++) {
      dna.push(Math.floor(Math.random() * nbDirections) + 1)
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
      if (road.collide(x, y)) {
        // road.color = 'rgb(255, 255, 0)'
        car.crash()
      }
      if (road.contains(x, y)) found = road
    }
    if (found) car.checkDistance(found)
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
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
      xmin: this.x - DEFAULT_ROAD_LENGTH * 1.5,
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

  isStraight (road) {
    const reg = /^([^A-Z]+)(.*$)/
    const debut = road.type.replace(reg, '$1')
    const fin = road.type.replace(reg, '$2').toLowerCase()
    return (debut !== 'left' && debut !== 'right' && fin !== 'left' && fin !== 'right')
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

  calculateFitness (maxscore, minscore) {
    const last = this.getLastRoad()
    if (!last) return 0
    // this.normalizedScore = maxscore - minscore === 0 ? 0 : (this.score - minscore) / (maxscore - minscore)
    const dist = distance(this.x, this.y, last.x, last.y)
    this.fitness = this.score - dist
    // console.log('fff', this.normalizedScore, this.score, maxscore, minscore, this.roads.length)
    return this.fitness
  }

  update () {
    if (this.dead) return
    const reg = /^([^A-Z]+)(.*$)/
    const last = this.getLastRoad()
    let newRoad
    if (this.roads.length < this.size) {
      if (this.isFake) {
        switch (this.roads.length) {
          case 0:
            newRoad = new Road(last.x, last.y, 'leftDown')
            break;
          case 1:
            newRoad = new Road(last.x, last.y, 'upDown')
            break;
          case 2:
            newRoad = new Road(last.x, last.y, 'upLeft')
            break;
          case 3:
            newRoad = new Road(last.x, last.y, 'rightUp')
            break;
          case 4:
            newRoad = new Road(last.x, last.y, 'downUp')
            break;
          case 5:
            newRoad = new Road(last.x, last.y, 'downRight')
            break;
        }
        this.roads.push(newRoad)
        // switch (this.roads.length) {
        //   case 0:
        //     this.roads.push(new Road(last.x, last.y, 'leftDown'))
        //     break;
        //   case 1:
        //     this.roads.push(new Road(last.x, last.y, 'upDown'))
        //     break;
        //   case 2:
        //     this.roads.push(new Road(last.x, last.y, 'upDown'))
        //     break;
        //   case 3:
        //     this.roads.push(new Road(last.x, last.y, 'upDown'))
        //     break;
        // }
      } else {
        const dd = false
        newRoad = new Road(last.x, last.y, this.getNextType(last))
        // Hors champ
        if (newRoad.xFin - DEFAULT_ROAD_LENGTH < this.bounds.xmin || 
            newRoad.xFin + DEFAULT_ROAD_LENGTH > this.bounds.xmax || 
            newRoad.yFin - DEFAULT_ROAD_LENGTH < this.bounds.ymin || 
            newRoad.yFin + DEFAULT_ROAD_LENGTH > this.bounds.ymax) {
          if(dd) console.log('Hors champ')
          this.dead = true
        }
        if (last && last.type) {
          const debutSecond = newRoad.type.replace(reg, '$1')
          const finSecond = newRoad.type.replace(reg, '$2').toLowerCase()
          const debutFirst = last.type.replace(reg, '$1')
          const finFirst = last.type.replace(reg, '$2').toLowerCase()
          // Pas collé au precedent
          if (last.x !== newRoad.x && last.y !== newRoad.y) {
            // if(dd) console.log('Pas collé')
            this.dead = true
          }
          // Not inverse of precedent
          if(!this.isInverse(finFirst, debutSecond)) {
            // if(dd) console.log('Pas inverse')
            this.dead = true
          }
        }
        this.roads.forEach((r, index) => {
          if (index > 0 && r.intersects(newRoad.xFin, newRoad.yFin)) {
            if(dd) console.log('Intersect')
            this.dead = true
          }
        })
        this.roads.push(newRoad)
        const length = this.roads.length
        if (length > 1 && length < this.size) {
          const begin = this.roads[0]
          if (newRoad.xFin === begin.x && newRoad.yFin === begin.y) {
            if(dd) console.log('Reach before end')
            this.dead = true
          }
        }
        if (this.roads.length === this.size && !this.isClosed()) {
          if(dd) console.log('Not closed')
          this.dead = true
        }
      }
    }
    if (!this.dead) {
      this.frames++
      if (newRoad) {
        const dist = distance(this.x, this.y, newRoad.xFin, newRoad.yFin)
        this.score += newRoad.distance
        if (this.roads.length > this.size / 2 && dist > this.lastDist) this.score -= 25
        this.lastDist = dist
      } else {
        this.score++
      }
      if (last && !last.arc && newRoad.arc) this.score += 15
      if (this.roads.length === this.size) {
        console.log('GOAAAAAAAAAAALLLLLLLLLLL', this.size)
        if (this.isFake) {
          noLoop()
          return
        }
        this.score += 100 * this.size
        this.roads = []
        this.size += 2
        this.lastDist = 0
        this.setBounds()
      }
    } else {
      // console.log('IS DEAD !!')
      this.score -= 30
      this.roads.pop()
    }
    // console.log('SCORE', this.score, this.lastDist)
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
    // if (this.isBest || this.first) 
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
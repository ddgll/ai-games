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
    this.normalizedScore = 0
    this.isFake = false
    this.best = isBest
    this.first = false
    this.lastDist = null
    this.lastDir = null
    this.size = size || DEFAULT_CIRCUIT_SIZE
    this.roads = []
    if (this.size === 999) {
      this.isFake = true
      this.size = DEFAULT_CIRCUIT_SIZE + 2
    }
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
    if (!road) {
      console.log('Bizare', this.roads)
      throw new Error('Raod not exists')
    }
    return {
      x: road.xFin,
      y: road.yFin,
      type: road.type
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

  getNextType (last_) {
    const last = last_ || {
      x: this.x / width,
      y: this.y / height
    }
    const inputs = [
      this.roads.length / this.size,
      this.x / width,
      this.y / height,
      last.x / width,
      last.y / height,
      this.bounds.xmin / width,
      this.bounds.xmax / width,
      this.bounds.ymin / height,
      this.bounds.ymax / height,
      distance(this.x, this.y, last.x, last.y) / (this.size * DEFAULT_ROAD_LENGTH)
    ].concat(last.type ? this.oneHotEncode(last.type) : [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0])

    const outputs = this.brain.activate(inputs)
    const label = this.oneHotDecode(outputs)
    // console.log('THINK', JSON.stringify(outputs), label)
    return label    
  }

  isClosed () {
    const last = this.getLastRoad()
    // console.log(this.roads, last, this.x, this.y)
    if (last.x === this.x && last.y === this.y) {
      return true
    }
    return false
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
    this.fitness = this.score - this.distance
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
      // if (newRoad) {
      //   const dist = distance(this.x, this.y, newRoad.xFin, newRoad.yFin)
      //   if (this.lastDist !== null) {
      //     const delta = dist - this.lastDist
      //     this.score += 1 - delta / DEFAULT_ROAD_LENGTH
      //   } else {
      //     this.score++
      //   }
      //   this.lastDist = dist
      //   if (this.roads.length > this.size / 2 && dist > this.lastDist) this.score -= 5
      // } else {
      //   this.score++
      // }
      this.score ++
      if (this.roads.length === this.size) {
        console.log('GOAAAAAAAAAAALLLLLLLLLLL', this.size)
        if (this.isFake) {
          noLoop()
          return
        }
        this.score += 10 * this.size
        this.roads = []
        this.size += 2
        this.lastDist = 0
        this.setBounds()
      }
    } else {
      // console.log('IS DEAD !!')
      this.score -= 1
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
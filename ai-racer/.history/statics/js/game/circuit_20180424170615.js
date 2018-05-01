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
  constructor (x, y, size, dadBrain, momBrain, isBest) {
    this.x = x
    this.y = y
    this.dead = false
    this.score = 0
    this.frames = 0
    this.fitness = 0
    this.isFake = false
    this.best = isBest
    this.size = size || DEFAULT_CIRCUIT_SIZE
    this.roads = []
    if (this.size === 999) {
      this.isFake = true
      this.size = DEFAULT_CIRCUIT_SIZE
      return
    }

    if (!isBest) {
      if (dadBrain) {
        if (momBrain) {
          this.brain = neataptic.Network.crossOver(dadBrain, momBrain)
        } else {
          this.brain = neataptic.Network.fromJSON(dadBrain.toJSON())
        }
        const mutation = floor(random(3))
        if (mutation === 1) {
          this.brain.mutate(neataptic.methods.mutation.MOD_ACTIVATION)
        } else if (mutation === 2) {
          this.brain.mutate(neataptic.methods.mutation.MOD_BIAS)
        } else {
          this.brain.mutate(neataptic.methods.mutation.MOD_WEIGHT)
        }
      } else {
        this.brain = new neataptic.architect.Random(17, 4, 12)
      }
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
    return {
      x: road.xFin,
      y: road.yFin
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
      y: this.y / height,
      type: 'rightLeft'
    }
    const length = this.dead ? this.roads.length - 1 : this.roads.length
    const inputs = [
      this.size / MAX_SIZE,
      this.x / width,
      this.y / height,
      last.x / width,
      last.y / height,
      length ? distance(this.x, this.y, last.x, last.y) / length * DEFAULT_ROAD_LENGTH : 0
    ].concat(this.oneHotEncode(last.type))

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

  isDead () {
    // this.isFake ? console.log('isDead for FAKE') : console.log('isDead')
    const reg = /^([^A-Z]+)(.*$)/
    if (this.roads.length >= 2) {
      for (let i = 0, l = this.roads.length - 1; i < l; i++) {
        const first = this.roads[i]
        const second = this.roads[i + 1]
        const debutSecond = second.type.replace(reg, '$1')
        const finSecond = second.type.replace(reg, '$2').toLowerCase()
        const debutFirst = first.type.replace(reg, '$1')
        const finFirst = first.type.replace(reg, '$2').toLowerCase()

        if (first.xFin !== second.x && first.yFin !== second.y) {
          // console.log('Fin diff de debut')
          return true
        }
        if (!this.isInverse(finFirst, debutSecond)) {
          // console.log('Not Inverse')
          return true
        }
        if (first.x < 0 || first.x > width || first.y < 0 || first.y > height || second.x < 0 || second.x > width || second.y < 0 || second.y > height) {
          // console.log('Hors champ')
          return true
        }
        const exists = this.roads.filter(r => r.x === first.x && r.y === first.y && r.type === first.type)
        if (exists.length > 1) {
          // console.log('Road exists')
          return true
        }
      }
    }
    if (this.roads.length === this.size && !this.isClosed()) {
      // console.log('Not closed')
      return true
    }
    return false
  }

  calculateFitness () {
    const last = this.getLastRoad()
    if (!last) return 1
    const length = this.dead ? this.roads.length - 1 : this.roads.length
    const dista = length * DEFAULT_ROAD_LENGTH
    this.fitness = dista / (distance(this.x, this.y, last.x, last.y) + DEFAULT_ROAD_LENGTH)
    // this.fitness += this.score
    // console.log('FF Calc', this.fitness, this.score, dista, distance(this.x, this.y, last.x, last.y) + 1)
    return this.fitness
  }

  update () {
    if (this.dead) return
    const last = this.getLastRoad()
    if (this.roads.length < this.size) {
      if (this.isFake) {
        switch (this.roads.length) {
          case 0:
            this.roads.push(new Road(last.x, last.y, 'leftDown'))
            break;
          case 1:
            this.roads.push(new Road(last.x, last.y, 'upLeft'))
            break;
          case 2:
            this.roads.push(new Road(last.x, last.y, 'rightUp'))
            break;
          case 3:
            this.roads.push(new Road(last.x, last.y, 'downRight'))
            break;
        }
        // switch (this.roads.length) {
        //   case 0:
        //     this.roads.push(new Road(last.x, last.y, 'upDown'))
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
        this.roads.push(new Road(last.x, last.y, this.getNextType(last)))
      }
    }
    this.dead = this.isDead()
    if (!this.dead) {
      this.frames++
      this.score++
      if (last) {
        const dista = this.roads.length * DEFAULT_ROAD_LENGTH
      }
      if (this.roads.length === this.size) {
        console.log('OBJECTIFFFFFF !!!!!!!!!!!!!!!!', this.calculateFitness())
        this.score += 1000
        this.roads = []
        this.size += 2
        noLoop()
      }
    } else {
      this.roads.pop()
    }
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
    if (this.roads.find(r => r.type === 'upDown' || r.type === 'downUp' || r.type === 'leftRight' || r.type === 'rightLeft')) return
    this.roads.forEach(road => road.draw())
    const last = this.getLastRoad()
    for (let i = 0; i < this.roads.length; i++) {
      switch(i) {
        case 0:
          if (this.roads[i].type === 'leftDown') {
            console.log('FIRST Good')
          } else {
            return
          }
          break;
        case 1:
          if (this.roads[i].type === 'upLeft') {
            console.log('FIRST Good')
          } else {
            return
          }
          break;
        case 2:
          if (this.roads[i].type === 'rightUp') {
            console.log('FIRST Good')
          } else {
            return
          }
          break;
        case 3:
          if (this.roads[i].type === 'downRight') {
            console.log('FIRST Good')
          } else {
            return
          }
          break;
      }
    }
  }

  serialize (line) {
    str = line || "\n"
    this.roads.forEach(road => {
      if (str.length && str !== line) str += "-"
      str += `${road.type}`
    })
    str += ' dead: ' + this.dead
    return str
  }
}
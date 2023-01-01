class Circuit {
  static types = [
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

  constructor (x, y, size, dadBrain, momBrain, best) {
    this.x = x
    this.y = y
    this.dead = false
    this.fitness = 0
    this.size = size || DEFAULT_CIRCUIT_SIZE
    this.roads = []
    if (dadBrain) {
      if (momBrain) {
        this.brain = neataptic.Network.crossOver(dadBrain, momBrain)
      } else {
        this.brain = neataptic.Network.fromJSON(dadBrain.toJSON())
      }
      if (!best) {
        const mutation = floor(random(3))
        if (mutation === 1) {
          this.brain.mutate(neataptic.methods.mutation.MOD_ACTIVATION)
        } else if (mutation === 2) {
          this.brain.mutate(neataptic.methods.mutation.MOD_BIAS)
        } else {
          this.brain.mutate(neataptic.methods.mutation.MOD_WEIGHT)
        }
      }
    } else {
      this.brain = new neataptic.architect.Random(4, 4, 12)
    }
    // this.createRoads()
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

  oneHotEncode(letter){
    var zeros = Array.apply(null, Array(this.types.length)).map(Number.prototype.valueOf, 0);
    var index = this.types.indexOf(letter);
    zeros[index] = 1;
    return zeros;
  }

  oneHotDecode(zeros){
    var max = Math.max.apply(null, zeros);
    var index = zeros.indexOf(max);
    return this.types[index];
  }

  getNextType (last) {
    const inputs = [
      this.x / width,
      this.y / height,
      last.x / width,
      last.y / height
    ]

    const outputs = this.brain.activate(inputs)
    


    if (this.roads.length === 0) {
      return 'leftRight'
    }else if (this.roads.length === 1) {
      return 'leftUp'
    } else if (this.roads.length === 2) {
      return 'downUp'
    } else if (this.roads.length === 3) {
      return 'downLeft'
    } else if (this.roads.length === 4) {
      return 'rightLeft'
    } else if (this.roads.length === 5) {
      return 'rightDown'
    } else if (this.roads.length === 6) {
      return 'upDown'
    } else if (this.roads.length === 7) {
      return 'upRight'
    }
    
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

  calculateFitness () {
    const last = this.getLastRoad()
    return distance(this.x, this.y, last.x, last.y)
  }

  draw () {
    if (this.roads.length < this.size) {
      const last = this.getLastRoad()
      this.roads.push(new Road(last.x, last.y, this.getNextType(last)))
    }
    let str = '<hr>'
    this.roads.forEach(road => {
      if (str.length) str += '<br>'
      str += `${road.type}: (${road.x}, ${road.y})(${road.xFin}, ${road.yFin})`
      road.draw()
    })
    log.elt.innerHTML += str
  }
}
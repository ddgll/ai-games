class Circuit {
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
      this.brain = new neataptic.architect.Random(4, 4, 1)
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

  getNextType (last) {
    const inputs = [
      x / width,
      y / width,
      last.x / width,
      last.y / width
    ]
    if (this.roads.length === 0) {
      return 'horizontal'
    }else if (this.roads.length === 1) {
      return 'leftUp'
    } else if (this.roads.length === 2) {
      return 'vertical'
    } else if (this.roads.length === 3) {
      return 'rightUp'
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
      this.roads.push(last.x, last.y, this.getNextType(last))
    }
    this.roads.forEach(road => road.draw())
  }
}
'use strict';

const CONSTANTS = require('../statics/js/constants')
const nameGenerator = require('./generator')
const neataptic = require('neataptic')
const fs = require('fs')
const path = require('path')

module.exports = class Ga {
  constructor (game, nbI, nbO, io, options) {
    this.bestname = `./best-brain.json`
    const population = []

    this.nbInputs = nbI
    this.nbOutputs = nbO
    this.bestScore = 0

    this.io = io

    this.popsize = options && options.popsize ? options.popsize : CONSTANTS.MAX_PLAYER
    this.mutationRate = options && options.mutationRate ? options.mutationRate : 0.5
    this.elitism = options && options.elitism ? options.elitism : 0.3

    try {
      this.bestBrain = JSON.parse(fs.readFileSync(this.bestname, 'utf8'))
      const brain = neataptic.Network.fromJSON(this.bestBrain)
      for (let i = 0; i < this.popsize; i++) {
        population.push(brain)
      }
    } catch (e) {
      this.bestBrain = null
      console.log(e)
    }

    this.neat = new neataptic.Neat(
      this.nbInputs,
      this.nbOutputs,
      null,
      {
        selection: neataptic.methods.selection.FITNESS_PROPORTIONATE,
        // mutation: [neataptic.methods.mutation.MOD_WEIGHT, neataptic.methods.mutation.MOD_BIAS, neataptic.methods.mutation.MOD_ACTIVATION],
        // mutation: neataptic.methods.mutation.FFW,
        mutation: neataptic.methods.mutation.ALL,
        popsize: this.popsize,
        mutationRate: this.mutationRate,
        elitism: Math.round(this.elitism * this.popsize),
        // network: new neataptic.architect.Random(this.nbInputs, this.nbInputs*2, this.nbOutputs)
        network: new neataptic.architect.Perceptron(this.nbInputs, Math.round(this.nbInputs/2), Math.round(this.nbInputs/3), this.nbOutputs)
      }
    )
    if(population && population.length) this.neat.population = population

    this.game = game

    this.bots = []
  }

  startEvolution () {
    let bot
    this.bots = []
    this.game.context.flush()
    for(let genome in this.neat.population){
      genome = this.neat.population[genome]
      bot = this.game.context.addShip(nameGenerator('general'), genome)
      this.bots.push(bot)
    }
    console.log('Start evolution with', this.bots.length, 'bots', this.neat.population.length)
    this.game.startIntervals()
  }

  endEvolution(){
    this.game.stopIntervals()
    if (!this.neat) return
    this.calculateFitness()
    this.neat.sort()
  
    const bes = this.neat.getFittest()
    const bs = Math.round(bes.cScore > 3000 ? bes.cScore : bes.cDistance)
    const newPopulation = []
    if (bes && bs > this.bestScore) {
      this.bestBrain = bes.toJSON()
      console.log('NEW BEST SCORE !!! ', bs, '(gen:', this.neat.generation, ')')
      this.bestScore = bs
      const d = new Date()
      const name = `./brains/brain-${d.getTime()}-${bs}.json`
      this.io.emit('best', bs)
      fs.writeFileSync(path.resolve(name), JSON.stringify(this.bestBrain, null, 2), 'utf8')
      fs.writeFileSync(path.resolve(this.bestname), JSON.stringify(this.bestBrain, null, 2), 'utf8')
    } else if (this.bestBrain) {
      console.log('Generation end no best score...', bs, '(gen:', this.neat.generation, ')')
      newPopulation.push(neataptic.Network.fromJSON(this.bestBrain))
      newPopulation.push(neataptic.Network.fromJSON(this.bestBrain))
    }
    // Elitism
    for(let i = 0; i < this.neat.elitism; i++){
      newPopulation.push(this.neat.population[i])
    }
    // Breed the next individuals
    for(var i = 0; i < this.neat.popsize - this.neat.elitism; i++){
      newPopulation.push(this.neat.getOffspring())
    }
  
    // Replace the old population with the new population
    this.neat.population = newPopulation
    this.neat.mutate()
  
    this.neat.generation++
    this.startEvolution()
  }

  calculateFitness () {
    let max = 3000
    this.bots.forEach(c => {
      if (c.score > max) max = c.distance
    })
    this.bots.forEach(c => {
      c.brain.score = (max > 5000) ? c.score : (c.distance / c.frames)
      c.brain.cId = c.id
      c.brain.cScore = c.score
      c.brain.cDistance = c.distance
      c.brain.cFrames = c.frames
    })
  }
}

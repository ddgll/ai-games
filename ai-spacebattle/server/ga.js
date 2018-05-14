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
    this.mutationRate = options && options.mutationRate ? options.mutationRate : 0.3
    this.elitism = options && options.elitism ? options.elitism : 0.1

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
        network: new neataptic.architect.Random(this.nbInputs, this.nbInputs/2, this.nbOutputs)
        // network: new neataptic.architect.Perceptron(this.nbInputs, this.nbInputs, Math.round(this.nbInputs/2), this.nbOutputs)
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
    this.game.startIntervals()
  }

  endEvolution(frames){
    this.game.stopIntervals()
    if (!this.neat) return
    this.calculateFitness(frames)
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
    } else {
      console.log('End evolution without best...', bs, '(gen:', this.neat.generation, ')')
    }

    // Provenance
    for(let i = 0; i < this.neat.provenance; i++){
      if (this.bestBrain) {
        newPopulation.push(neataptic.Network.fromJSON(this.bestBrain))
      } else {
        newPopulation.push(neataptic.Network.fromJSON(this.neat.template.toJSON()))
      }
    }

    // Elitism
    for(let i = 0; i < this.neat.elitism; i++){
      newPopulation.push(this.neat.population[i])
    }

    this.neat.population = newPopulation

    // Breed the next individuals
    for(let i = 0, l = this.neat.popsize - this.neat.elitism - this.neat.provenance; i < l; i++){
      this.neat.population.push(this.neat.getOffspring())
    }
  
    // Replace the old population with the new population
    // this.neat.population = newPopulation
    this.neat.mutate()
  
    this.neat.generation++
    this.startEvolution()
  }

  calculateFitness (frames) {
    // let max = 10000
    // this.bots.forEach(c => {
    //   if (c.score > max) max = c.distance
    // })
    this.bots.forEach(c => {
      // c.brain.score = (max > 10000) ? c.score : (c.distance / c.frames)
      c.brain.score = (c.distance / frames)
      c.brain.cId = c.id
      c.brain.cScore = c.score
      c.brain.cDistance = c.distance
      c.brain.cFrames = c.frames
    })
  }
}

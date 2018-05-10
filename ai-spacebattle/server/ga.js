const CONSTANTS = require('../statics/js/constants')
const nameGenerator = require('./generator')
const neataptic = require('neataptic')

module.exports = class Ga {
  constructor (game, nbI, nbO, options, population) {
    this.nbInputs = nbI
    this.nbOutputs = nbO
    this.bestScore = 0

    this.popsize = options && options.popsize ? options.popsize : CONSTANTS.MAX_PLAYER
    this.mutationRate = options && options.mutationRate ? options.mutationRate : 0.3
    this.elitism = options && options.elitism ? options.elitism : 0.1

    this.neat = new neataptic.Neat(
      this.nbInputs,
      this.nbOutputs,
      null,
      {
        selection: neataptic.methods.selection.FITNESS_PROPORTIONATE,
        // mutation: [neataptic.methods.mutation.MOD_WEIGHT, neataptic.methods.mutation.MOD_BIAS, neataptic.methods.mutation.MOD_ACTIVATION],
        mutation: neataptic.methods.mutation.FFW,
        // mutation: neataptic.methods.mutation.ALL,
        popsize: this.popsize,
        mutationRate: this.mutationRate,
        elitism: Math.round(this.elitism * this.popsize),
        network: new neataptic.architect.Random(this.nbInputs, 0, this.nbOutputs)
      }
    )
    if(population && population.length) this.neat.population = population

    this.game = game

    this.bots = []
  }

  startEvolution () {
    let bot
    this.bots = []
    for(let genome in this.neat.population){
      genome = this.neat.population[genome]
      bot = this.game.context.addShip(nameGenerator('general'), genome)
      this.bots.push(bot)
    }
  }

  endEvolution(){
    if (!this.neat) return
    this.calculateFitness()
    this.neat.sort()
  
    const bes = this.neat.getFittest()
    if (bes && bes.cScore > this.bestScore) {
      const jsonBrain = bes.toJSON()
      console.log('New Best', bes.cScore, '(gen:', this.neat.generation, ')')
      this.bestScore = bes.cScore
    }
    const newPopulation = []
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
    this.bots.forEach(c => {
      c.brain.score = c.calculateFitness()
      c.brain.cId = c.id
      c.brain.cScore = c.score
      c.brain.cFrames = c.frames
    })
  }
}

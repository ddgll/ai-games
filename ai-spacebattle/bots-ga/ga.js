const neataptic = require('neataptic')

module.exports = class GeneticAlgorithm {
  constructor (options, population) {
    this.index = 0
    this.inputs = options && options.inputs ? options.inputs : 0
    this.actions = options && options.actions ? options.actions : 0
    this.hidden = options && options.hidden ? options.hidden : 100
    this.nbPopulation = options && options.nbPopulation ? options.nbPopulation : 100
    this.mutationRate = options && options.mutationRate ? options.mutationRate : 0.3
    this.elitismPercent = options && options.elitismPercent ? options.elitismPercent : 0.1
    this.mutation = options && options.mutation ? options.mutation : neataptic.methods.mutation.ALL
    this.mutationAmount = options && options.mutationAmount ? options.mutationAmount : 2
    this.provenance = options && options.provenance ? options.provenance : 1
    this.neat = new neataptic.Neat(
      this.inputs,
      this.actions,
      () => {},
      {
        selection: neataptic.methods.selection.FITNESS_PROPORTIONATE,
        // mutation: [neataptic.methods.mutation.MOD_WEIGHT, neataptic.methods.mutation.MOD_BIAS, neataptic.methods.mutation.MOD_ACTIVATION],
        // mutation: neataptic.methods.mutation.FFW,
        mutation: this.mutation,
        popsize: this.nbPopulation,
        mutationRate: this.mutationRate,
        mutationAmount: this.mutationAmount,
        provenance: this.provenance,
        elitism: Math.round(this.elitismPercent * this.elitismPercent),
        network: new neataptic.architect.Perceptron(this.inputs, this.hidden / 2, this.hidden / 4, this.actions * 2, this.actions)
      }
    )
    console.log('NEAT Created')
    this.neat.generation = 1
    // this.neat.mutate()
    // this.neat.mutate()
    // this.neat.mutate()
    // this.neat.mutate()
    // this.neat.mutate()
    if(population && population.length) this.neat.population = population
  }

  getNextBrain () {
    if (this.index >= this.neat.population.length) return null
    const brain = { index: this.index, brain: this.neat.population[this.index] }
    this.index++
    return brain
  }

  setBrainScore (index, score) {
    if (typeof this.neat.population[index] === 'undefined') return
    this.neat.population[index].score = score
  }

  endEvaluation () {
    if (!this.neat) return
    return this.neat.evolve().then((fittest) => {
      this.index = 0
      return fittest
    })
    // this.neat.sort()
    // const newPopulation = []
    // // Elitism
    // for(let i = 0; i < this.neat.elitism; i++){
    //   newPopulation.push(this.neat.population[i])
    // }
    // // Breed the next individuals
    // for(var i = 0; i < this.neat.popsize - this.neat.elitism; i++){
    //   newPopulation.push(this.neat.getOffspring())
    // }
    // // Replace the old population with the new population
    // this.neat.population = newPopulation
    // this.neat.mutate()
    // this.neat.generation++
  }
}

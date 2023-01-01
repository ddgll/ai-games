import { POINT_CONVERSION_COMPRESSED } from "constants";

function initNeat (population) {
  neat = new neataptic.Neat(
    11,
    2,
    {
      mutation: neataptic.methods.mutation.ALL,
      popsize: POPULATION,
      mutationRate: MUTATION_RATE,
      elitism: Math.round(ELITISM_PERCENT * POPULATION),
      network: new neataptic.architect.Random(11, 11, 2)
    }
  )
  if(population && population.length) neat.population = population
}

function startEvaluation(x, y){
  cars = []
  for(var genome in neat.population){
    genome = neat.population[genome]
    cars.push(new Car(x, y, genome))
  }
}

function endEvaluation(){
  calculateFitness()
  neat.sort()

  var newPopulation = []
  // Elitism
  for(var i = 0; i < neat.elitism; i++){
    newPopulation.push(neat.population[i])
  }

  // Breed the next individuals
  for(var i = 0; i < neat.popsize - neat.elitism; i++){
    newPopulation.push(neat.getOffspring())
  }

  // Replace the old population with the new population
  neat.population = newPopulation
  neat.mutate()

  neat.generation++
  startEvaluation()
}

function calculateFitness () {

}

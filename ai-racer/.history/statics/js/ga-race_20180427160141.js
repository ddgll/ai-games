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

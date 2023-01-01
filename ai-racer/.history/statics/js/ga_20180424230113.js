function initGeneration () {
  neat = new neataptic.Neat(
    17,
    12,
    calculateFitness,
    {
      mutation: neataptic.methods.mutation.ALL,
      popsize: POPULATION,
      mutationRate: MUTATION_RATE,
      elitism: Math.round(ELITISM_PERCENT * POPULATION),
      network: new neataptic.architect.Random(17, 17, 12)
    }
  )
  numGeneration++
}

function startEvaluation () {
  for(var genome in neat.population){
    genome = neat.population[genome];
    genome.circuitIndex = circuits.length
    circuits.push(new Circuit (X_START, Y_START, DEFAULT_CIRCUIT_SIZE, genome))
  }
}

function endEvaluation(){
  const fittest = neat.getFittest()
  best = new Circuit (10, 10, DEFAULT_CIRCUIT_SIZE, fittest)
  const bes = circuits[fittest.circuitIndex]
  best.copyRoads(bes.roads)
  drawGraph(fittest.graph(300, 200), '.svg')

  neat.sort();
  var newPopulation = [];

  // Elitism
  for(var i = 0; i < neat.elitism; i++){
    newPopulation.push(neat.population[i]);
  }

  // Breed the next individuals
  for(var i = 0; i < neat.popsize - neat.elitism; i++){
    newPopulation.push(neat.getOffspring());
  }

  // Replace the old population with the new population
  neat.population = newPopulation;
  neat.mutate();

  neat.generation++;
  startEvaluation();
}

function calculateFitness (a, b, c) {
  // console.log('CALCULATE', a, b, c)
  const circuit = circuits[a.circuitIndex]
  if (!circuit) return 0
  return circuit.calculateFitness()
}

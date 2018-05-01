function initGeneration () {
  neat = new neataptic.Neat(
    17,
    12,
    null,
    {
      mutation: neataptic.methods.mutation.ALL,
      popsize: POPULATION,
      mutationRate: MUTATION_RATE,
      elitism: Math.round(ELITISM_PERCENT * POPULATION),
      network: new neataptic.architect.Random(17, 0, 12)
    }
  )
}

function startEvaluation () {
  circuits = []
  for(var genome in neat.population){
    genome = neat.population[genome];
    genome.circuitIndex = circuits.length
    circuits.push(new Circuit (X_START, Y_START, DEFAULT_CIRCUIT_SIZE, genome))
  }
}

function endEvaluation(){
  let m = 0, b
  circuits.forEach(c => {
    if (c.size > m) {
      m = c.size
      b = c
    }
  })
  calculateFitness (m)
  const fittest = neat.getFittest()
  best = new Circuit (10, 10, DEFAULT_CIRCUIT_SIZE, fittest)
  const bes = circuits[fittest.circuitIndex]
  best.copyRoads(bes.roads)
  drawGraph(fittest.graph(300, 200), '.svg')
  localStorage.getItem('air-bestscore', bes.score)
  localStorage.getItem('air-bestframes', bes.frames)
  localStorage.getItem('air-bestfitness', bes.fitness)
  localStorage.getItem('air-bestnumgen', numGeneration)

  neat.sort();
  // console.log(neat)
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

function calculateFitness (a) {
  const circuit = circuits[a.circuitIndex]
  if (!circuit) return 0
  circuit.calculateFitness()
  // console.log('CALCULATE', circuit.fitness)
  a.score = circuit.fitness
  return a.score
}

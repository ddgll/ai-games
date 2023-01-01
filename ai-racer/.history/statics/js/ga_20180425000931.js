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
  calculateFitness ()
  const fittest = neat.getFittest()
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

function calculateFitness () {
  let sum = 0, max = 0, min
  circuits.forEach(c => {
    if (c.score > m) m = c.score
  })
  circuits.forEach(c => {
    const fit = circuit.calculateFitness(m)
    sum += fit
    if (fit > bestFitness) {
      bestFitness = fit
      bes = c
    }
  })
  circuits.forEach(c => circuit.calculateFitness(m))
  best = new Circuit (10, 10, DEFAULT_CIRCUIT_SIZE, b.brain, true)
  const bes = circuits[fittest.circuitIndex]
  best.copyRoads(bes.roads)
  drawGraph(fittest.graph(300, 200), '.svg')
  if (bes.score > bestScore) {
    bestScore = bes.score
    bestFrames = bes.frames
    bestFitness = bes.fitness
    localStorage.getItem('air-bestscore', bes.score)
    localStorage.getItem('air-bestframes', bes.frames)
    localStorage.getItem('air-bestfitness', bes.fitness)
    localStorage.getItem('air-bestnumgen', numGeneration)
  }
  circuits.forEach(c => circuit.calculateFitness(m))
}

function initGeneration (brain) {
  neat = new neataptic.Neat(
    17,
    12,
    null,
    {
      mutation: [neataptic.methods.mutation.MOD_BIAS, neataptic.methods.mutation.ADD_NODE],
      popsize: POPULATION,
      mutationRate: MUTATION_RATE,
      elitism: Math.round(ELITISM_PERCENT * POPULATION),
      network: new neataptic.architect.Random(17, 0, 12)
    }
  )
  if (brain) {
    const population = []
    for (let i = 0; i < POPULATION; i++) {
      population.push(brain)
    }
    neat.population = population
  }
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
  let sum = 0, max = 0, min = Infinity, bes
  circuits.forEach(c => {
    if (c.score > max) max = c.score
    if (c.score < min) min = c.score
    if (c.score > bestScore) {
      bes = c
    }
  })
  circuits.forEach(c => {
    const fit = c.calculateFitness(max, min)
    sum += fit
  })
  circuits.forEach(c => {
    c.fitness = c.fitness / sum
    c.brain.score = c.fitness
  })
  if (bes) {
    best = new Circuit (100, 100, DEFAULT_CIRCUIT_SIZE, bes.brain, true)
    best.copyRoads(bes.roads)
    drawGraph(bes.brain.graph(300, 200), '.svg')
    bestScore = Math.round(bes.score)
    bestFrames = bes.frames
    bestFitness = bes.fitness
    bestNumGen = neat.generation
    bestBrain = JSON.stringify(bes.brain.toJSON())
    localStorage.setItem('air-bestscore', bes.score)
    localStorage.setItem('air-bestframes', bes.frames)
    localStorage.setItem('air-bestfitness', bes.fitness)
    localStorage.setItem('air-bestnumgen', numGeneration)
    localStorage.setItem('air-bestbrain', bestBrain)
  }
}

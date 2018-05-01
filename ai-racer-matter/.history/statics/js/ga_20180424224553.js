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
    circuits.push(new Circuit (X_START, Y_START, DEFAULT_CIRCUIT_SIZE, genome))
  }
}

function endEvaluation(){
  console.log('Generation:', neat.generation, '- average score:', neat.getAverage());

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
  console.log(a, b, c)
  let sum = 0, mf = Infinity, bg = 0, bsum = 0, bes, bf = 0
  dead.forEach(b => {
    sum += b.calculateFitness()
    if (b.fitness > bf) {
      bf = b.fitness * 1
      bes = b
    }
    if (b.fitness < mf) mf = b.fitness
  })
  // ai=(ai - amin)/(amax - amin) 

  dead.forEach(b => {
    // console.log('FITNESS', b.fitness, b.fitness / sum, b.serialize())
    b.fitness = (b.fitness - mf) / (bf - mf)
  })
  if (bes && (bes.score > bestScore || bf > bestFitness)) {
    console.log(bes.serialize())
    bestFitness = bes.fitness
    bestFrames = bes.frames
    bestScore = bes.score
    bestNumGen = numGeneration
    localStorage.setItem('air-bestbrain', JSON.stringify(bes.brain.toJSON()))
    localStorage.setItem('air-bestscore', bestScore)
    localStorage.setItem('air-bestframes', bes.frames)
    localStorage.setItem('air-bestfitness', bes.fitness)
    localStorage.setItem('air-bestnumgen', numGeneration)
    best = new Circuit(100, 100, bes.size, null, null, true)
    best.copyRoads(bes.roads)
    console.log('!!!!!!! GENERAtion Stats Génération: ', numGeneration, ' SCORE: ', bestScore, ' FIT: ', bestFitness)
    drawGraph(bes.brain.graph(300, 200), '.svg')
  } else {
    // console.log('NEXT GEN Best:', bf)
  }
}

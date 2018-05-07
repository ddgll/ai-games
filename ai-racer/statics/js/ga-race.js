function initGeneration (population) {
  testCar = null
  neat = new neataptic.Neat(
    17,
    8,
    null,
    {
      selection: neataptic.methods.selection.FITNESS_PROPORTIONATE,
      // mutation: [neataptic.methods.mutation.MOD_WEIGHT, neataptic.methods.mutation.MOD_BIAS, neataptic.methods.mutation.MOD_ACTIVATION],
      // mutation: neataptic.methods.mutation.FFW,
      mutation: neataptic.methods.mutation.ALL,
      popsize: POPULATION,
      mutationRate: MUTATION_RATE,
      elitism: Math.round(ELITISM_PERCENT * POPULATION),
      network: new neataptic.architect.Random(17, 17, 8)
    }
  )
  if(population && population.length) neat.population = population
}

function startEvaluation(x, y){
  if (testCar) return
  cars = []
  for(var genome in neat.population){
    genome = neat.population[genome]
    cars.push(new Car(x, y, genome))
  }
}

function endEvaluation(x, y){
  if (!neat) return
  calculateFitness()
  neat.sort()

  const bes = neat.getFittest()
  if (bes && bes.cScore > bestScore) {
    // console.log('NEW BEST SCORE !!!!', bes.cScore)
    const jsonBrain = bes.toJSON()
    if (bestTurns >= 3) {
      // db.brains.put({
      //   id: bes.cId,
      //   circuitId: circuit.id,
      //   score: bes.cScore,
      //   frames: bes.cFrames,
      //   brain: jsonBrain
      // })
      nb3Turns++
    }
    best = new Car (X_START, Y_START, neataptic.Network.fromJSON(jsonBrain), true)
    bestBrain = jsonBrain
    bestScore = bes.cScore
    bestTurns = bes.cTurns
    bestFrames = bes.cFrames
    bestNumGen = neat.generation
    // drawGraph(bes.graph(300, 200), '.svg')
  } else if (bestBrain) {
    best = new Car (X_START, Y_START, neataptic.Network.fromJSON(bestBrain), true)
  }
  // if (bestTurns === 3) {
  //   neat.mutation = [neataptic.methods.mutation.MOD_WEIGHT, neataptic.methods.mutation.MOD_BIAS, neataptic.methods.mutation.MOD_ACTIVATION]
  // }

  var newPopulation = []
  // Elitism
  for(var i = 0; i < neat.elitism; i++){
    newPopulation.push(neat.population[i])
  }

  // console.log('NEW POP', newPopulation)

  // Breed the next individuals
  for(var i = 0; i < neat.popsize - neat.elitism; i++){
    newPopulation.push(neat.getOffspring())
  }

  // Replace the old population with the new population
  neat.population = newPopulation
  neat.mutate()

  neat.generation++
  startEvaluation(x, y)
}

function calculateFitness () {
  let sum = 0, max = 0, min = Infinity, bes, wins = []
  cars.forEach(c => {
    c.brain.score = c.calculateFitness()
    c.brain.cId = c.id
    c.brain.cScore = c.score
    c.brain.cFrames = c.frames
    c.brain.cTurns = c.turns
    // const fit = c.calculateFitness()
    // sum += fit
    // if (c.score > max) max = c.score
    // if (c.score < min) min = c.score
    // if (c.score > bestScore) bes = c
    // if (c.win) wins.push(c)
  })
  // sum += 1
  // cars.forEach(c => {
  //   c.fitness = c.fitness / sum
  //   c.brain.score = c.fitness
  // })
  
  return wins
}

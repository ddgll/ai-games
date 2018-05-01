function initGeneration (population) {
  testCar = null
  neat = new neataptic.Neat(
    13,
    6,
    null,
    {
      selection: methods.selection.FITNESS_PROPORTIONATE,
      mutation: [neataptic.methods.mutation.MOD_WEIGHT, neataptic.methods.mutation.MOD_BIAS, neataptic.methods.mutation.MOD_ACTIVATION],
      popsize: POPULATION,
      mutationRate: MUTATION_RATE,
      elitism: Math.round(ELITISM_PERCENT * POPULATION),
      network: new neataptic.architect.Random(13, 10, 6)
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
  startEvaluation(x, y)
}

function calculateFitness () {
  let sum = 0, max = 0, min = Infinity, bes, wins = []
  cars.forEach(c => {
    const fit = c.calculateFitness()
    sum += fit
    if (c.score > max) max = c.score
    if (c.score < min) min = c.score
    if (c.score > bestScore) bes = c
    if (c.win) wins.push(c)
  })
  sum += 1
  cars.forEach(c => {
    c.fitness = c.fitness / sum
  })
  if (bes) {
    console.log('NEW BEST SCORE !!!!', bes.score)
    best = new Car (X_START, Y_START, bes.brain, true)
    best.dead = false
    bestScore = bes.score
    bestFitness = bes.fitness
    bestNumGen = neat.generation
  } else {
    console.log('NEXT Gen')
  }
  return wins
}

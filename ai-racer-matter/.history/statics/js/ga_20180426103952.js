function initCircuits () {
  for (let i = 0; i < POPULATION; i++) {
    circuits.push(new Circuit(X_START, Y_START, DEFAULT_CIRCUIT_SIZE))
  }
}

function nextGeneration () {
  calculateFitness()
  const elites = getElitesDna()
  circuits = []
  for (let i = 0; i < POPULATION; i++) {

  }
  numGeneration++
}

function swap (a, i, j) {
  const temp = a[i]
  a[i] = a[j]
  a[j] = temp
}

function getChildDna (elites) {
  const p1 = pickOneGenome(elites)
  const p2 = pickOneGenome(elites)

}

function mutate (dna) {

}

function pickOneGenome (parents) {
  let index = 0, r = Math.random()
  while (r > 0 && index < parents.length) r -= parents[index++].fitness
  return parents[--index].dna
}

function getElitesDna () {
  const elites = []
  const length = Math.round(POPULATION * ELITISM_PERCENT)
  const population = circuits.slice()
  population.sort((a, b) => a.fitness - b.fitness)
  for (let i = 0; i < length; i++) {
    elite.push({
      fitness: population[i].fitness,
      dna: population[i].dna
    })
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

  numGeneration++;
  startEvaluation();
}

function calculateFitness () {
  let sum = 0, max = 0, min = Infinity, bes
  circuits.forEach(c => {
    const fit = c.calculateFitness()
    sum += fit
    if (c.score > max) max = c.score
    if (c.score < min) min = c.score
    if (c.score >= bestScore) {
      bes = c
    }
  })
  circuits.forEach(c => {
    const fit = c.calculateFitness()
    sum += fit
  })
  circuits.forEach(c => {
    c.fitness = c.fitness / sum
    c.brain.score = c.fitness
  })
  if (bes) {
    best = new Circuit (100, 100, bestSize, bes.dna, true)
    bestScore = Math.round(bes.score)
    bestFitness = bes.fitness
    bestNumGen = numGeneration
    bestBrain = JSON.stringify(bes.brain.toJSON())
    localStorage.setItem('air-bestsize', bes.size)
    localStorage.setItem('air-bestscore', bes.score)
    localStorage.setItem('air-bestframes', bes.frames)
    localStorage.setItem('air-bestfitness', bes.fitness)
    localStorage.setItem('air-bestnumgen', numGeneration)
    localStorage.setItem('air-bestbrain', bestBrain)
    localStorage.setItem('air-bestroads', JSON.stringify(bes.roads))
  }
}

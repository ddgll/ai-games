function initCircuits () {
  for (let i = 0, c; i < POPULATION; i++) {
    c = new Circuit(X_START, Y_START, DEFAULT_CIRCUIT_SIZE)
    console.log('DNA', c.dna)
    c.roadsFromDna()
    circuits.push(c)

  }
}

function nextGeneration () {
  calculateFitness()
  const elites = getElitesDna()
  circuits = []
  for (let i = 0, c; i < POPULATION; i++) {
    c = new Circuit(X_START, Y_START, DEFAULT_CIRCUIT_SIZE, getChildDna(elites))
    c.roadsFromDna()
    circuits.push(c)
  }
  numGeneration++
}

function swap (a, i, j) {
  const temp = a[i]
  a[i] = a[j]
  a[j] = temp
}

function crossOver (dna1, dna2) {
  var order1 = dna1.slice()
  var order2 = dna2.slice()
  // Pick a random start and endpoint
  var start = floor(random(order1.length))
  var end = floor(random(start + 1, order1.length + 1))
  // Grab part of the the first order
  var neworder = order1.slice(start, end)
  // How many spots do we need to add?
  var leftover = order1.length - neworder.length
  // Go through order 2
  var count = 0
  var i = 0
  // As long as we aren't finished
  while (count < leftover) {
    // Take a city from order2
    var city = order2[i]
    // If it isn't part of the new child path yet
    if (!neworder.includes(city)) {
      // Add it!
      neworder.push(city)
      count++
    }
    i++
  }
  return neworder
}

function getChildDna (elites) {
  const p1 = pickOneGenome(elites)
  const p2 = pickOneGenome(elites)
  const childDna = crossOver(p1, p2)
  return mutate(childDna)
}

function mutate (dna) {
  if (random(1) < MUTATION_RATE) {
    shuffle(dna)
  }
}

function shuffle (dna) {
  const i = floor(random(dna.length));
  const j = floor(random(dna.length));
  swap(dna, i, j)
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
  })
  if (bes) {
    test = new Circuit (X_START, 100, DEFAULT_CIRCUIT_SIZE, bes.dna, true)
    bestScore = Math.round(bes.score)
    bestFitness = bes.fitness
    bestNumGen = numGeneration
    localStorage.setItem('air-bestscore', bes.score)
    localStorage.setItem('air-bestfitness', bes.fitness)
    localStorage.setItem('air-bestnumgen', numGeneration)
    localStorage.setItem('air-bestdna', JSON.stringify(bes.dna))
  }
}

function initCircuits () {
  for (let i = 0, c; i < POPULATION; i++) {
    c = new Circuit(X_START, Y_START, DEFAULT_CIRCUIT_SIZE)
    circuits.push(c)
  }
}

function nextGeneration () {
  const winners = calculateFitness()
  if (winners.length) return winners
  const elites = getElitesDna()
  circuits = []
  for (let i = 0, c; i < POPULATION; i++) {
    c = new Circuit(X_START, Y_START, DEFAULT_CIRCUIT_SIZE, getChildDna(elites))
    c.roadsFromDna()
    circuits.push(c)
  }
  numGeneration++
  return null
}

function swap (a, i, j) {
  const temp = a[i]
  a[i] = a[j]
  a[j] = temp
}

function OLDcrossOver (dna1, dna2) {
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
  // As long as we aren't finished
  while (count < leftover) {
    // Take a road from order2
    var dir = order2[count]
    // Add it!
    neworder.push(dir)
    count++
  }
  return neworder
}

function crossOver (dna1, dna2) {
  const newdna = []
  const mid = floor(random(dna1.lastGoodIndex + 1, dna1.length))
  for (let i = 0, l = dna1.lastGoodIndex + 1; i < l; i++) {
    newdna[i] = dna1[i]
  }
  for (let i = dna1.lastGoodIndex, l = dna1.length; i < l; i++) {
    newdna[i] = Math.floor(random(3))
  }
  return newdna
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
  if (parents.length === 1) return parents[0].dna
  let index = 0, r = Math.random()
  while (r > 0 && index < parents.length) r -= parents[index++].fitness
  return parents[--index].dna
}

function getElitesDna () {
  const elites = []
  const length = Math.round(POPULATION * ELITISM_PERCENT)
  const population = circuits.slice()
  population.sort((a, b) => b.fitness - a.fitness)
  for (let i = 0; i < length; i++) {
    elites.push(population[i])
  }
  return elites
}

function calculateFitness () {
  let sum = 0, max = 0, min = Infinity, bes, winners = []
  circuits.forEach(c => {
    const fit = c.calculateFitness()
    sum += fit
    if (c.score > max) max = c.score
    if (c.score < min) min = c.score
    if (c.score > bestScore) bes = c
    if (c.win) winners.push(c)
  })
  circuits.forEach(c => {
    const fit = c.calculateFitness()
    sum += fit
  })
  sum += 1
  circuits.forEach(c => {
    c.fitness = c.fitness / sum
  })
  if (bes) {
    console.log('NEW BEST SCORE !!!!', best.score)
    best = new Circuit (100, 100, DEFAULT_CIRCUIT_SIZE, bes.dna, true)
    bestScore = bes.score
    bestFitness = bes.fitness
    bestNumGen = numGeneration
    localStorage.setItem('air-bestdna', JSON.stringify(bes.dna))
  }
  return winners
}

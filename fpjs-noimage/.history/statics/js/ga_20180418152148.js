function nextGeneration () {
  calculateFitness()
  for (let i = 0; i < POPULATION; i++) {
    birds.push(pickOneGenome())
  }
}

function pickOneGenome () {
  let index = 0
  let r = random(1)
  while (r > 0) {
    r = r - birds[index].fitness
    index++
  }
  index--
  return birds[index].brain
}

function pickParents () {
  const dadBrain = pickOneGenome()
  const momBrain = pickOneGenome()
  return new Bird(dadBrain, momBrain)
}

function calculateFitness () {
  const sum = dead.map(b => b.score).reduce((a, b) => a + b)
  dead.forEach(b => b.fitness = b.score / sum)
}

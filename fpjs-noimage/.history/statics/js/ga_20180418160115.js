function nextGeneration () {
  const parents = calculateFitness()
  for (let i = 0; i < POPULATION; i++) {
    birds.push(createBaby(parents))
  }
}

function pickOneGenome (parents) {
  let index = 0
  let r = random(1)
  while (r > 0) {
    r -= parents[index].fitness
    index++
  }
  index--;
  return parents[index].brain
}

function createBaby (parents) {
  const dadBrain = pickOneGenome(parents)
  const momBrain = pickOneGenome(parents)
  return new Bird(dadBrain, momBrain)
}

function calculateFitness () {
  let sum = 0
  dead.forEach(b => {
    sum += pow(b.score, 2)
  })
  let max = 0, fsum = 0
  dead.forEach(b => {
    b.fitness = b.score / sum
  })
  return dead.slice(0, 10)
}

function poolSelection(birds) {
  let index = 0
  let r = random(1)
  while (r > 0) {
    r -= birds[index].fitness
    index++
  }
  index--;
  return birds[index].brain;
}

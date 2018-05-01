var numGeneration = 0

function nextGeneration () {
  numGeneration++
  const parents = calculateFitness()
  for (let i = 0; i < POPULATION; i++) {
    birds.push(createBaby(dead))
  }
  console.log('NEXT GENERATION', numGeneration)
  if (best) birds.push(best)
  if (numGeneration % 2) {
    dead = []
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
    if (!best || b.score > best.score) {
      best = b
      console.log('NEW BEST', best.score)
    }
    sum += pow(b.score, 2)
  })
  let max = 0
  dead.forEach(b => {
    b.fitness = pow(b.score, 2) / sum
  })
  // dead.sort((a, b) => a.fitness - b.fitness)
  // return dead.slice(0, POPULATION/3)
}

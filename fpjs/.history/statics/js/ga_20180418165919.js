var numGeneration = 0

function nextGeneration () {
  numGeneration++
  const bs = calculateFitness()
  for (let i = 0; i < POPULATION; i++) {
    birds.push(createBaby(dead))
  }
  console.log('NEXT GENERATION', numGeneration, 'BESt score:', bs, bestScore)
  if (best) {
    best.score = 0
    birds.push(best)
  }
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
  let sum = 0, bg = 0
  dead.forEach(b => {
    if (b.score > bg) bg = b.score * 1
    if (!best || b.score > bestScore) {
      best = b
      bestScore = b.bestScore * 1
      console.log('NEW BEST', best.score)
    }
    sum += pow(b.score, 2)
  })
  let max = 0
  dead.forEach(b => {
    b.fitness = pow(b.score, 2) / sum
  })
  return bg
  // dead.sort((a, b) => a.fitness - b.fitness)
  // return dead.slice(0, POPULATION/3)
}

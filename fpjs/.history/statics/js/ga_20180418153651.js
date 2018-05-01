function nextGeneration () {
  const parents = calculateFitness()
  console.log('PARENTS', parents)
  for (let i = 0; i < POPULATION; i++) {
    birds.push(createBaby(parents))
  }
}

function pickOneGenome (parents) {
  const selected = parents[Math.floor(Math.random()*parents.length)]
  return parents[index].brain
}

function createBaby (parents) {
  const dadBrain = pickOneGenome(parents)
  const momBrain = pickOneGenome(parents)
  return new Bird(dadBrain, momBrain)
}

function calculateFitness () {
  const sum = dead.map(b => b.score).reduce((a, b) => a + b)
  let max = 0, fsum = 0
  dead.forEach(b => {
    b.fitness = b.score / sum
    fsum = b.fitness
    if (b.fitness > max) max = b.fitness
  })
  dead.sort((a, b) => a.fitness - b.fitness)
  console.log('MAX FITNESS', max, dead)
  return dead.slice(0, POPULATION/2)
}

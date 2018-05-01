function nextGeneration () {
  calculateFitness()
  for (let i = 0; i < POPULATION; i++) {
    birds.push(createBaby())
  }
}

function pickOneGenome () {
  let index = 0
  let r = random(1)
  while (r > 0) {
    r = r - dead[index].fitness
    index++
  }
  index--
  console.log('PARENT FITNESS', dead[index].fitness)
  return dead[index].brain
}

function createBaby () {
  const dadBrain = pickOneGenome()
  const momBrain = pickOneGenome()
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
  dead.sort(a, b => a.fitness - b.fitness)
  console.log('MAX FITNESS', max, dead)
  return dead.slice(0, POPULATION/2)
}

function nextGeneration () {
  calculateFitness()
  for (let i = 0; i < POPULATION; i++) {
    birds.push(new Bird())
  }
}

function calculateFitness () {
  const sum = dead.map(b => b.score).reduce((a, b) => a + b)
  dead.forEach(b => b.fitness = b.score / sum)
}

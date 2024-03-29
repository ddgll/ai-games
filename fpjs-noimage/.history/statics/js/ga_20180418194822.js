var numGeneration = 0

function nextGeneration () {
  numGeneration++
  calculateFitness()
  for (let i = 0; i < POPULATION; i++) {
    birds.push(createBaby(dead))
  }
  if (best) {
    localStorage.setItem('bestbrain', JSON.stringify(best.brain.toJSON()))
    // best = new Bird(best.brain, null, true)
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
  return new Bird(dadBrain) // , momBrain)
}

function calculateFitness () {
  let sum = 0, bg = 0, bsum = 0
  dead.forEach(b => {
    if (b.score > bg) bg = b.score * 1
    if (!best || b.score > bestScore) {
      best = new Bird(b.brain, null, true)
      bestScore = b.score * 1
    }
    bsum += b.score
    sum += pow(b.score, 2)
  })
  let max = 0
  dead.forEach(b => {
    b.fitness = pow(b.score, 2) / sum
  })
  if (bestScore === bg) {
    console.log('!!!!!!! GENERAtion Stats BS', numGeneration, 'BEST', bg, 'MOY', Math.round(bsum / dead.length))
  } else {
    best.killed = false
    best.y = height / 2
    console.log('GENERAtion Stats BS', numGeneration, 'BEST', bg, 'MOY', Math.round(bsum / dead.length))
  }
}

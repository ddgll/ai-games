var regen = false
var numGeneration = 0

function nextGeneration () {
  regen = false
  numGeneration++
  calculateFitness()
  for (let i = 0; i < POPULATION; i++) {
    birds.push(createBaby(dead))
  }
  if (best) {
    localStorage.setItem('bestbrain', JSON.stringify(best.brain.toJSON()))
    localStorage.setItem('bestscore', bestScore)
  }
  dead = []
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
  return new Circuit(dadBrain, momBrain, DEFAULT_CIRCUIT_SIZE)
}

function calculateFitness () {
  let sum = 0, bg = 0, bsum = 0, bes
  dead.forEach(b => {
    if (b.score > bg) {
      bes = b
      bg = b.score * 1
    }
    sum += b.calculateFitness()
  })
  dead.forEach(b => {
    b.fitness = pow(b.fitness, 2) / sum
  })
  if (bg > bestScore) {
    bfrs = bes.frames
    bestScore = bes.score
    bestnumgen = numGeneration
    localStorage.setItem('bestfrs', bes.frames)
    localStorage.setItem('bestnumgen', numGeneration)
    best = new Circuit(bes.x, bes.y, bes.brain)
    drawGraph(bes.brain.graph(300, 200), '.svg')
    console.log('!!!!!!! GENERAtion Stats Génération: ', numGeneration, ' SCORE: ', bfrs)
  } else {
    best = new Circuit(best.x, best.y, best.brain)
    // console.log('GENERAtion Stats BS', numGeneration, 'BEST', bg, 'MOY', Math.round(bsum / dead.length))
  }
}

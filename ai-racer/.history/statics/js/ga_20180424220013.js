
function nextGeneration () {
  numGeneration++
  calculateFitness()
  let x = X_START, y = Y_START
  const elite = getElite(dead)
  for (let i = 0; i < POPULATION; i++) {
    circuits.push(createBaby(X_START, Y_START, elite))
  }
  dead = []
}

function getElite(dead) {
  dead = dead.sort((a, b) => b.fitness - a.fitness)
  const elite = dead.slice(0, POPULATION * ELITE_PERCENT)
  return elite
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

function createBaby (x, y, parents) {
  const dadBrain = pickOneGenome(parents).brain
  const momBrain = pickOneGenome(parents).brain
  return new Circuit(x, y, dadBrain, momBrain, DEFAULT_CIRCUIT_SIZE)
}

function calculateFitness () {
  let sum = 0, bg = 0, bsum = 0, bes, bf = 0
  dead.forEach(b => {
    sum += b.calculateFitness()
    if (b.fitness > bf) {
      bf = b.fitness * 1
      bes = b
    }
  })
  dead.forEach(b => {
    console.log('FITNESS', b.fitness, b.fitness / sum, b.serialize())
    b.fitness = b.fitness / sum
  })
  if (bes && bes.score > bestScore) {
    console.log('!!!!!!! GENERAtion Stats Génération: ', numGeneration, ' SCORE: ', bestScore, ' FIT: ', bf)
    console.log(bes.serialize())
    bestFrames = bes.frames
    bestScore = bes.score
    bestnumgen = numGeneration
    localStorage.setItem('air-bestbrain', JSON.stringify(bes.brain.toJSON()))
    localStorage.setItem('air-bestscore', bestScore)
    localStorage.setItem('air-bestframes', bes.frames)
    localStorage.setItem('air-bestnumgen', numGeneration)
    best = new Circuit(100, 100, bes.size, null, null, true)
    best.copyRoads(bes.roads)
    drawGraph(bes.brain.graph(300, 200), '.svg')
  } else {
    console.log('NEXT GEN Best:', bf)
  }
}

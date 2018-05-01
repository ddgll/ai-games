var numGeneration = 0
var bestScore = 0
var best
var bestFrames = 0

function nextGeneration () {
  numGeneration++
  calculateFitness()
  let x = X_START, y = Y_START
  for (let i = 0; i < POPULATION; i++) {
    circuits.push(createBaby(x, y, dead))
    x += X_START
    if (i % 5 && x > (X_START * 2)) {
      x = X_START
      y += Y_START
    }
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

function createBaby (x, y, parents) {
  const dadBrain = pickOneGenome(parents).brain
  const momBrain = pickOneGenome(parents).brain
  return new Circuit(x, y, dadBrain, momBrain, DEFAULT_CIRCUIT_SIZE)
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
    b.fitness = b.fitness / sum
    console.log('FITNESS', b.fitness, b.roads.length)
  })
  if (bg > bestScore) {
    bestFrames = bes.frames
    bestScore = bes.score
    bestnumgen = numGeneration
    localStorage.setItem('air-bestbrain', JSON.stringify(bes.brain.toJSON()))
    localStorage.setItem('air-bestscore', bestScore)
    localStorage.setItem('air-bestframes', bes.frames)
    localStorage.setItem('air-bestnumgen', numGeneration)
    best = new Circuit(bes.x, bes.y, bes.brain)
    drawGraph(bes.brain.graph(300, 200), '.svg')
    console.log('!!!!!!! GENERAtion Stats Génération: ', numGeneration, ' SCORE: ', bestFrames)
  } else {
    best = new Circuit(best.x, best.y, best.brain)
    // console.log('GENERAtion Stats BS', numGeneration, 'BEST', bg, 'MOY', Math.round(bsum / dead.length))
  }
}

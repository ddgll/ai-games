var numGeneration = 0

function nextGeneration () {
  const savHTML = log.elt.innerHTML + ''
  numGeneration++
  calculateFitness()
  for (let i = 0; i < POPULATION; i++) {
    if (i % 10 && best) {
      birds.push(new Bird(best.brain))
    } else {
      birds.push(createBaby(dead))
    }
  }
  if (best) {
    localStorage.setItem('bestbrain', JSON.stringify(best.brain.toJSON()))
    localStorage.setItem('bestscore', bestScore)
    // best = new Bird(best.brain, null, true)
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
  return new Bird(dadBrain, momBrain)
}

function calculateFitness () {
  let sum = 0, bg = 0, bsum = 0, bes
  dead.forEach(b => {
    if (b.score > bg) {
      bes = b
      bg = b.score * 1
    }
    bsum += b.score
    sum += pow(b.score, 2)
  })
  let max = 0
  dead.forEach(b => {
    b.fitness = pow(b.score, 2) / sum
  })
  if (bg > bestScore) {
    bfrs = bes.frames
    bestScore = bes.score
    localStorage.setItem('bestfrs', bes.frames)
    best = new Bird(bes.brain, null, true)
    console.log('!!!!!!! GENERAtion Stats Génération: ', numGeneration, ' SCORE: ', bfrs)
  } else {
    best = new Bird(best.brain, null, true)
    // console.log('GENERAtion Stats BS', numGeneration, 'BEST', bg, 'MOY', Math.round(bsum / dead.length))
  }
}

var numGeneration = 0
const POPULATION = 50
var best = null
var bestScore = 0
var birds = []
var dead = []
var brain

function init () {
  const container = document.getElementById('container')
  const saved = localStorage.getItem('qbestbrain')
  const bsaved = localStorage.getItem('qbestscore')

  try {
    brain = saved ? neataptic.Network.fromJSON(JSON.parse(saved)) : null
  } catch(e) {
    console.error('FAILED TO Load best', e)
  }

  createGames(brain)
}

function getGame (iid) {
  return '<div class="game"><div id="' + iid + '"></div><div id="log' + iid + '"></div></div>'
}

function createGames(brain_, next) {
  let brain = next ? createBaby(dead) : brain_
  container.innerHTML = ''
  container.innerHTML += getGame('game')
  for (let i = 1; i < POPULATION; i++) container.innerHTML += getGame('game' + i)
  new p5(sketch(brain_, 'game', (bird) => {
    dead.push(bird)
    if (dead.length === POPULATION) nextGeneration()
  }), 'game')
  for (let i = 1; i < POPULATION; i++) {
    new p5(sketch(brain, 'game' + i, (bird) => {
      dead.push(bird)
      if (dead.length === POPULATION) nextGeneration()
    }), 'game' + i)
  }
}

function nextGeneration () {
  numGeneration++
  calculateFitness()
  console.log('NEW LENGTH', birds.length)
  if (best) {
    localStorage.setItem('qbestbrain', JSON.stringify(best.brain.toJSON()))
    localStorage.setItem('qbestscore', bestScore)
  }
  createGames(best.brain, true)
  dead = []
}

function pickOneGenome (parents) {
  let index = 0
  let r = Math.random()
  while (r > 0 && index < parents.length) {
    r -= parents[index++].fitness
  }
  return parents[--index]
}

function createBaby (parents) {
  const dadBrain = pickOneGenome(parents).brain
  const momBrain = pickOneGenome(parents).brain
  return neataptic.Network.crossOver(dadBrain, momBrain)
}

function calculateFitness () {
  let sum = 0, bg = 0, bsum = 0
  dead.forEach(b => {
    if (b.score > bg) bg = b.score * 1
    if (!best || b.score > bestScore) {
      best = b
      bestScore = b.score * 1
    }
    bsum += b.score
    sum += Math.pow(b.score, 2)
  })
  let max = 0
  dead.forEach(b => {
    b.fitness = Math.pow(b.score, 2) / sum
  })
  if (bestScore === bg) {
    console.log('!!!!!!! GENERAtion Stats BS', numGeneration, 'BEST', bg, 'MOY', Math.round(bsum / dead.length))
  } else {
    console.log('GENERAtion Stats BS', numGeneration, 'BEST', bg, 'MOY', Math.round(bsum / dead.length))
  }
}

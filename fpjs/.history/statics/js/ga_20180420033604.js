var numGeneration = 0
const POPULATION = 30
var best = null
var bestScore = 0
var dead = []
var games = []
var brain
var brains

function init () {
  const container = document.getElementById('container')
  const saved = localStorage.getItem('qbestbrain')
  const bsaved = localStorage.getItem('qbestscore')

  numGeneration = localStorage.getItem('numGeneration')
  if (!numGeneration) numGeneration = 0

  new p5(function (p) {
    p.setup = function () {
      var button = p.createButton('START')
      button.position(10, 9);
      button.mousePressed(() => {
        games.forEach(g => g.loop())
      })
      button = p.createButton('STOP')
      button.position(110, 9);
      button.mousePressed(() => {
        games.forEach(g => g.noLoop())
      })
      button = p.createButton('TOGGLE')
      button.position(210, 9);
      button.mousePressed(() => {
        games.forEach(g => g.canvas.style.display = g.canvas.style.display === 'none' ? 'block' : 'none')
      })
    }
  }, 'master')

  try {
    brain = saved ? neataptic.Network.fromJSON(JSON.parse(saved)) : null
  } catch (e) {}
  
  try {
    brains = JSON.parse(localStorage.getItems('brains'))
  } catch (e) { }

  createGames(brain, brains)
}

function getGame (iid) {
  return '<div class="game"><div id="' + iid + '"></div><div id="log' + iid + '"></div></div>'
}

function createGames(brain_, brains) {
  let brain = brains && brains.length ? createBaby(brains) : brain_
  container.innerHTML = ''
  container.innerHTML += getGame('game')
  for (let i = 1; i < POPULATION; i++) container.innerHTML += getGame('game' + i)
  new p5(sketch(brain_, 'game', (bird) => {
    dead.push(bird)
    if (dead.length === POPULATION) nextGeneration()
  }, games), 'game')
  for (let i = 1; i < POPULATION; i++) {
    new p5(sketch(brain, 'game' + i, (bird) => {
      dead.push(bird)
      if (dead.length === POPULATION) nextGeneration()
    }, games), 'game' + i)
  }
}

function nextGeneration () {
  numGeneration++
  localStorage.setItem('numGeneration', numGeneration)
  games.forEach(p => p.remove())
  calculateFitness()
  if (best) {
    localStorage.setItem('qbestbrain', JSON.stringify(best.brain.toJSON()))
    localStorage.setItem('qbestscore', bestScore)
  }
  document.location.reload()
  // createGames(best.brain, true)
  // dead = []
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
  return neataptic.Network.crossOver(neataptic.Network.fromJSON(JSON.parse(dadBrain)), neataptic.Network.fromJSON(JSON.parse(momBrain)))
}

function calculateFitness () {
  const data = []
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
    data.push({
      fitness: b.fitness,
      brain: b.brain
    })
  })
  localStorage.setItems('brains', JSON.stringify(data))
  if (bestScore === bg) {
    console.log('!!!!!!! GENERAtion Stats BS', numGeneration, 'BEST', bg, 'MOY', Math.round(bsum / dead.length))
  } else {
    console.log('GENERAtion Stats BS', numGeneration, 'BEST', bg, 'MOY', Math.round(bsum / dead.length))
  }
}

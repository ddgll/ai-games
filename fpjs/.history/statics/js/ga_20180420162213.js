var numGeneration = 0
const POPULATION = 10
var dead = []
var games = []
var brain
var brains = []
var pipes = []
var db
var bsaved

function init () {
  navigator.storage.estimate().then(c => console.log(c))
  db = new Dexie("fppt")
  db.version(1).stores({
    brains: 'id,fitness'
  })
  const container = document.getElementById('container')
  const saved = localStorage.getItem('qbestbrain')
  const gsaved = localStorage.getItem('qbestgen')
  const fcsaved = localStorage.getItem('qbestfc')
  bsaved = localStorage.getItem('qbestscore')

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
      p.createDiv('<h1>' + numGeneration + ' BEST Score: ' + bsaved + ' <small><em>(gen. ' + gsaved + ')</em></small> FC: ' + fcsaved + '<h1/>')
    }
  }, 'master')

  try {
    brain = saved ? neataptic.Network.fromJSON(JSON.parse(saved)) : null
  } catch (e) {}
  
  try {
    db.brains.each(b => brains.push(b)).then(() => {
      if (numGeneration % 10 === 0 ) {
        createGames(brain)
      } else {
        createGames(brain, brains)
      }
      db.delete()
      db.version(1).stores({
        brains: 'id,fitness'
      })
      db.open()
    })
  } catch (e) { 
    createGames(brain, brains)
  }

}

function getGame (iid) {
  return '<div class="game"><div id="' + iid + '"></div><div id="log' + iid + '"></div></div>'
}

function createGames(brain_, brains) {
  container.innerHTML = ''
  container.innerHTML += getGame('game')
  for (let i = 1; i < POPULATION; i++) container.innerHTML += getGame('game' + i)
  const bestDeath = (bird) => {
    bird.killed = false
    bird.reset()
  }
  const childDeath = (bird) => {
    dead.push(bird)
    if (dead.length === POPULATION) nextGeneration()
  }
  new p5(sketch(brain_, 'game', bestDeath, true), 'game')
  for (let i = 0; i < POPULATION; i++) {
    let brain = brains && brains.length ? createBaby(brains) : brain_
    new p5(sketch(brain, 'game' + i, childDeath, false), 'game' + i)
  }
}

function nextGeneration () {
  numGeneration++
  localStorage.setItem('numGeneration', numGeneration)
  games.forEach(p => p.remove())
  calculateFitness()
  // createGames(best.brain, true)
  // dead = []
}

function uuid () {
  let d = new Date().getTime()
  if(window.performance && typeof window.performance.now === "function") d += performance.now()
  let uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    let r = (d + Math.random()*16)%16 | 0
    d = Math.floor(d/16)
    return (c=='x' ? r : (r&0x3|0x8)).toString(16)
  })
  return uuid
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
  const rd = Math.random()
  const dadBrain = pickOneGenome(parents).brain
  if (rd > 0.5) return neataptic.Network.fromJSON(dadBrain)
  const momBrain = pickOneGenome(parents).brain
  return neataptic.Network.crossOver(neataptic.Network.fromJSON(dadBrain), neataptic.Network.fromJSON(momBrain))
}

function calculateFitness () {
  const data = []
  let sum = 0, bg = 0, bsum = 0, best, bestScore
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
  const promises = []
  dead.forEach(b => {
    b.fitness = Math.pow(b.score, 2) / sum
    promises.push(db.brains.put({
      id: uuid(),
      fitness: b.fitness,
      brain: b.brain.toJSON()
    }))
  })
  if (best && bsaved < bestScore) {
    localStorage.setItem('qbestbrain', JSON.stringify(best.brain.toJSON()))
    localStorage.setItem('qbestscore', bestScore)
    localStorage.setItem('qbestgen', numGeneration)
    localStorage.setItem('qbestfc', best.frameCount)
  }
  Promise.all(promises).then(() => document.location.reload()).catch(e => {
    console.error(e)
    // setTimeout(() => document.location.reload(), 10000)
  })
}

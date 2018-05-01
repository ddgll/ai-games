const FRAME_RATE = 10
const POPULATION = 250
const DEFAULT_ROAD_LENGTH = 25
const DEFAULT_ROAD_WIDTH = 25
const DEFAULT_CIRCUIT_SIZE = 6
const DEBUG = true
const MAX_SIZE = 200
const ELITISM_PERCENT = 0.1
const MUTATION_RATE = 0.3

var neat
var counter = 0
var size = 4
var slider, sliderm, log, circuits, dead, roads, X_START, Y_START
var numGeneration = 0
var bestScore = localStorage.getItem('air-bestscore')
var best
var bestSize = localStorage.getItem('air-bestsize')
var bestFrames = localStorage.getItem('air-bestframes')
var bestFitness = localStorage.getItem('air-bestfitness')
var bestNumGen = localStorage.getItem('air-bestnumgen')
var bestBrain = localStorage.getItem('air-bestbrain')
var bestRoads = localStorage.getItem('air-bestroads')
var drawClones = true

/***************************************************** */

FAIRE CREATEUR DE CIRCUIT AVEC LES FLECHES POUR AJUSTER CALCUL SCORE

!!!!!!!!!!!!!!!!!!!!!!!!!! A LIRE

/***************************************************** */

if (!bestScore) bestScore = 0

function sqr(a) {
  return a*a;
}

function distance(x1, y1, x2, y2) {
  return Math.sqrt(sqr(y2 - y1) + sqr(x2 - x1));
}

function setup () {
  if (!bestSize) {
    bestSize = DEFAULT_CIRCUIT_SIZE
  } else {
    bestSize = parseInt(bestSize)
  }
  frameRate(FRAME_RATE)
  createCanvas(1000, 800)
  X_START = DEFAULT_ROAD_LENGTH * 2
  Y_START = height / 3
  log = createDiv('')

  slider = createSlider(1, 100, 1)
  sliderm = createSlider(1, 20, 5)
  log = createDiv('LOG')
  let button = createButton('START')
  button.position(1050, 9);
  button.mousePressed(() => {
    loop();
  })
  button = createButton('STOP')
  button.position(1050, 49);
  button.mousePressed(() => {
    noLoop();
  })
  button = createButton('RESET')
  button.position(1050, 89);
  button.mousePressed(() => {
    noLoop();
    localStorage.removeItem('air-bestscore')
    localStorage.removeItem('air-bestframes')
    localStorage.removeItem('air-bestfitness')
    localStorage.removeItem('air-bestnumgen')
    localStorage.removeItem('air-bestbrain')
    localStorage.removeItem('air-bestsize')
    localStorage.removeItem('air-bestroads')
    document.location.reload()
  })
  button = createButton('Reset Frame Rate')
  button.position(1050, 129);
  button.mousePressed(() => {
    slider.value(1)
    sliderm.value(1)
  })
  button = createButton('SHOW Best brain')
  button.position(1050, 169);
  button.mousePressed(() => {
    drawGraph(best.brain.graph(300, 200), '.svg')
  })
  button = createButton('TOGGLE')
  button.position(1050, 209);
  button.mousePressed(() => {
    drawClones = !drawClones;
  })

  let brain
  if (bestBrain) {
    try {
      brain = bestBrain ? neataptic.Network.fromJSON(JSON.parse(bestBrain)) : null
      if (brain) {
        best = new Circuit (100, 100, bestSize, brain, true)
        drawGraph(brain.graph(300, 200), '.svg')
      }
    } catch(e) {
      brain = null
      console.error('FAILED TO Load best', e)
    }
  }

  if (bestRoads) {
    const broads = JSON.parse(bestRoads)
    best.copyRoads(broads)
  }

  initGeneration(brain)
  circuits = []
  startEvaluation()
  // circuits.push(new Circuit (X_START, Y_START, 999))
  // roads = [
  //   new Road(100, 60, 'upDown'),
  //   new Road(150, 85, 'downUp'),
  //   new Road(200, 60, 'leftRight'),
  //   new Road(250, 60, 'rightLeft'),

  //   new Road(100, 110, 'leftUp'),
  //   new Road(150, 110, 'leftDown'),
  //   new Road(200, 110, 'rightUp'),
  //   new Road(250, 110, 'rightDown'),

  //   new Road(100, 160, 'upLeft'),
  //   new Road(150, 160, 'downLeft'),
  //   new Road(200, 160, 'upRight'),
  //   new Road(250, 160, 'downRight')
  // ]
  roads = []
  // best = null
}

function toDate (frs) {
  const seconds = Math.ceil(frs / 30)
  if (seconds < 60) return seconds + 's.'
  const minutes = Math.ceil(seconds / 60)
  if (minutes < 60) return minutes + 'mn.'
  const hours = Math.ceil(minutes / 60)
  if (hours < 24) return hours + 'h.'
  const days = Math.ceil(hours / 24)
  return days + 'j.'
}

function draw () {
  const maxc = slider.value() * sliderm.value()
  const frameR = Math.round(frameRate())
  let str = ''
  if (best && neat && neat.generation) {
    str += '<h1 style="margin: 4px 0">BEST - score:' + Math.round(bestScore) + ' - size:' + bestSize + ' - gen: ' + bestNumGen + '</h1>'
    str += 'best fitness:' + bestFitness
    str += '<br>best path: ' + best.serialize()
    str += 'Gen:' + neat.generation
    str += '<br><small>x' + maxc + ' f ' + frameR + '</small>'
  }
  log.elt.innerHTML = str
  for (let i = 0; i < maxc; i++) {
    counter++
    let max = 0, cmax, alives = false
    circuits.forEach((circuit, index) => {
      circuit.update()
      if (circuit.score > max) {
        max  = circuit.score
        cmax = circuit
      }
      if (!circuit.dead) alives = true
    })
    if (cmax) cmax.first = true
    if (!alives) {
      counter = 0
      if (neat) endEvaluation()
    }
  }
  background(0)

  if (drawClones) {
    circuits.forEach(circuit => circuit.draw())
    roads.forEach(road => road.draw())
  }

  if (best) {
    // best.update()
    best.draw()
  }
}

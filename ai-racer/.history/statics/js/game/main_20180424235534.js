const FRAME_RATE = 5
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
var bestFrames = localStorage.getItem('air-bestframes')
var bestFitness = localStorage.getItem('air-bestfitness')
var bestNumGen = localStorage.getItem('bestnumgen')

function sqr(a) {
  return a*a;
}

function distance(x1, y1, x2, y2) {
  return Math.sqrt(sqr(y2 - y1) + sqr(x2 - x1));
}

function setup () {
  frameRate(FRAME_RATE)
  createCanvas(1000, 800)
  X_START = width / 2
  Y_START = height / 2
  log = createDiv('')

  slider = createSlider(1, 100, 1)
  sliderm = createSlider(1, 20, 1)
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
  initGeneration()
  dead = []
  circuits = []
  startEvaluation()
  // circuits.push(new Circuit (X_START, Y_START, 999))
  // roads = [
  //   new Road(10, 60, 'upDown'),
  //   new Road(60, 60, 'downUp'),
  //   new Road(110, 60, 'leftRight'),
  //   new Road(160, 60, 'rightLeft'),

  //   new Road(10, 110, 'leftUp'),
  //   new Road(60, 110, 'leftDown'),
  //   new Road(110, 110, 'rightUp'),
  //   new Road(160, 110, 'rightDown'),

  //   new Road(210, 110, 'upLeft'),
  //   new Road(260, 110, 'downLeft'),
  //   new Road(310, 110, 'upRight'),
  //   new Road(360, 110, 'downRight')
  // ]
  roads = []
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
  log.elt.innerHTML = '<small>FPS multiplieur: ' + maxc + '</small> Frames: ' + frameCount + ' fr: ' + Math.round(frameRate())
  if (best && neat.generation) {
    log.elt.innerHTML += '<h1>Generation:' + neat.generation + '- average score:' + neat.getAverage()
    log.elt.innerHTML += '<br/>' + best.serialize('<br>')
  }
  for (let i = 0; i < maxc; i++) {
    counter++
    circuits.forEach((circuit, index) => {
      circuit.update()
    })
    const reste = circuits.filter(c => !c.dead).length
    if (reste === 0) {
      counter = 0
      endEvaluation()
      // noLoop()
    }
  }
  background(0)
  circuits.forEach(circuit => circuit.draw())
  roads.forEach(road => road.draw())

  if (best) {
    best.draw()
  }
}

const FRAME_RATE = 10
const POPULATION = 100
const DEFAULT_ROAD_LENGTH = 25
const DEFAULT_ROAD_WIDTH = 25
const DEFAULT_CIRCUIT_SIZE = 6
const DEBUG = true
const MAX_SIZE = 200
const ELITISM_PERCENT = 0.1
const MUTATION_RATE = 0.3

var pasApas = true
var counter = 0
var slider, sliderm, log, X_START, Y_START
var circuits = []
var best
var bestDna = localStorage.getItem('air-bestdna')
var bestScore = localStorage.getItem('air-bestscore')
var bestFitness = localStorage.getItem('air-bestfitness')
var bestNumGen = localStorage.getItem('air-bestnumgen')
var numGeneration = 0
if (!bestScore) bestScore = 0
if (!bestFitness) bestFitness = 0
if (!bestNumGen) bestNumGen = 0

function sqr(a) {
  return a*a;
}

function distance(x1, y1, x2, y2) {
  return Math.sqrt(sqr(y2 - y1) + sqr(x2 - x1));
}

function setup () {
  frameRate(FRAME_RATE)
  createCanvas(600, 600)
  X_START = width / 2
  Y_START = height / 2
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
    localStorage.removeItem('air-bestfitness')
    localStorage.removeItem('air-bestnumgen')
    localStorage.removeItem('air-bestdna')
    document.location.reload()
  })
  button = createButton('Reset Frame Rate')
  button.position(1050, 129);
  button.mousePressed(() => {
    slider.value(1)
    sliderm.value(1)
  })
  button = createCheckbox('Toggle pas à pas', pasApas)
  button.position(1050, 169);
  button.changed(() => {
    pasApas = !pasApas
    if (!pasApas) loop()
  })
  button = createButton('Reset TEST')
  button.position(1050, 209);
  button.mousePressed(() => {
    test = new Circuit (X_START, 100, DEFAULT_CIRCUIT_SIZE, null, false, true)
  })

  if (bestDna) {
    best = new Circuit(100, 100, DEFAULT_CIRCUIT_SIZE, JSON.parse(bestDna), true)
  }
  test = new Circuit (X_START, 100, DEFAULT_CIRCUIT_SIZE, null, false, true)

  initCircuits()
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
}

function draw () {
  const maxc = slider.value() * sliderm.value()
  let elites
  for (let i = 0; i < maxc; i++) {
    elites = nextGeneration()
    if (best && best.win) i = maxc
  }

  background(0)
  circuits.forEach(c => {
    if (!c.dead || (c.dead && c.score > DEFAULT_CIRCUIT_SIZE)) c.draw()
  })

  log.elt.innerHTML = '<small>FPS multiplieur: ' + maxc + '</small> Frames: ' +  ' gen: ' + numGeneration + '<br>'

  if (best) {
    log.elt.innerHTML += '<h1>BEST Score: ' + best.score + ' Fit: ' + best.fitness + '<h1>'
  }

  if (test) {
    test.draw()
    if (test.win) noLoop()
  }
  if (pasApas) noLoop()
}

String.prototype.capitalize = function () {
  return this.replace(/\b\w/g, l => l.toUpperCase())
}

function keyPressed () {
  var code
  if (keyCode === LEFT_ARROW) {
    code = 'left'
  } else if (keyCode === RIGHT_ARROW) {
    code = 'right'
  } else if (keyCode === UP_ARROW) {
    code = 'none'
  }
  if (code) {
    test.best = true
    test.addRoad(code)
    test.calculateFitness()
    loop()
  }
}

function getNextDirection (inverse, dir) {
  let value
  switch (inverse) {
    case 'up':
      switch (dir) {
        case 'left':
          value = 'Right'
          break;
        case 'right':
          value = 'Left'
          break;
        default:
          value = 'Down'
          break;
      }
      break;
    case 'down':
      switch (dir) {
        case 'left':
          value = 'Left'
          break;
        case 'right':
          value = 'Right'
          break;
        default:
          value = 'Up'
          break;
      }
      break;
    case 'left':
      switch (dir) {
        case 'left':
          value = 'Up'
          break;
        case 'right':
          value = 'Down'
          break;
        default:
          value = 'Right'
          break;
      }
      break;
    case 'right':
      switch (dir) {
        case 'left':
          value = 'Down'
          break;
        case 'right':
          value = 'Up'
          break;
        default:
          value = 'Left'
          break;
      }
      break;
  }
  return value
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

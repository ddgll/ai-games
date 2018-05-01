const FRAME_RATE = 30
const POPULATION = 100
const DEFAULT_ROAD_LENGTH = 30
const DEFAULT_ROAD_WIDTH = 30
var DEFAULT_CIRCUIT_SIZE
const DEBUG = true
const MAX_SIZE = 200
const ELITISM_PERCENT = 0.1
const MUTATION_RATE = 0.3
const CANVAS_WIDTH = 600
const CANVAS_HEIGHT = 700

var db
var counter = 0
var slider, sliderm, log, X_START, Y_START
var circuit
var roads
var best
var selectSize
var test
var bestDna = localStorage.getItem('air-bestdna')
var bestScore = -Infinity
var bestFitness
var bestNumGen
var numGeneration = 0
var winners

function sqr(a) {
  return a*a;
}

function distance(x1, y1, x2, y2) {
  return Math.sqrt(sqr(y2 - y1) + sqr(x2 - x1));
}

function reset (noResetCircuits) {
  winners = []
  numGeneration = 0
  bestScore = -Infinity
  best = null
  if (noResetCircuits) return
  circuits = []
}

function setup () {
  db = new Dexie("ai-racer")
  db.version(1).stores({
    circuits: 'id,size'
  })

  frameRate(FRAME_RATE)
  createCanvas(CANVAS_WIDTH, CANVAS_HEIGHT)
  const uiX = CANVAS_WIDTH + 10
  let uiY = 9
  X_START = width / 2
  Y_START = height / 2 + height / 5
  log = createDiv('')

  let button = createButton('START')
  button.position(uiX, uiY);
  button.mousePressed(() => {
    loop();
  })
  button = createButton('STOP')
  button.position(uiX, uiY+=40);
  button.mousePressed(() => {
    noLoop();
  })
  button = createButton('RESET')
  button.position(uiX, uiY+=40);
  button.mousePressed(() => {
    noLoop();
    document.location.reload()
  })
  button = createButton('Reset Frame Rate')
  button.position(uiX, uiY+=40);
  button.mousePressed(() => {
    slider.value(1)
    sliderm.value(1)
  })
  slider = createSlider(1, 100, 1)
  slider.position(uiX, uiY+=40)
  sliderm = createSlider(1, 20, 5)
  sliderm.position(uiX, uiY+=40)
  selectSize = createSelect()
  selectSize.position(uiX, uiY+=40)
  selectSize.changed(() => {
    DEFAULT_CIRCUIT_SIZE = +selectSize.value()
  })
  button = createButton('Change circuit')
  button.position(uiX, uiY+=40)
  button.mousePressed(() => {
    db.circuits.where('size').equals(DEFAULT_CIRCUIT_SIZE).toArray().then((circuits) => {
      if (!circuits || !circuits.length) {
        console.log(circuits, DEFAULT_CIRCUIT_SIZE)
        alert('Aucun circuit de cette taille...chelou...')
      }
      const dna = random(circuits)
      circuit = new Circuit(200, 200, DEFAULT_CIRCUIT_SIZE, dna.dna, false, false)
      circuit.roadsFromDna()
    })
  })

  db.circuits.orderBy('size').uniqueKeys((sizes) => {
    for (let size of sizes) {
      if (!DEFAULT_CIRCUIT_SIZE) DEFAULT_CIRCUIT_SIZE = size
      selectSize.option(size)
    }
  })

  log = createDiv('LOG')
  log.position(uiX, uiY+=40)

  
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
}

function draw () {
  const maxc = slider.value() * sliderm.value()

  for (let i = 0; i < maxc; i++) {
  }

  background(0)
  
  log.elt.innerHTML = '<small>FPS multiplieur: ' + maxc + '</small> Frames: ' +  ' gen: ' + numGeneration + ' SIZE:' + DEFAULT_CIRCUIT_SIZE + '<br>'

  if (circuit) circuit.draw()
  
  if (test) {
    test.draw()
    if (test.win) noLoop()
  }
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
  } else if (keyCode === DOWN_ARROW) {
    if (test.roads.length === 0) {
      this.test.roads.push(new Road(test.x, test.y, 'rightLeft'))
    } else {
      test.roads.pop()
      test.calculateFitness()
      loop()
    }
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

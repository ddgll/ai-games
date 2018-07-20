const FRAME_RATE = 30
var POPULATION = 1
const DEFAULT_ROAD_WIDTH = 50
var DEFAULT_CIRCUIT_SIZE
const DEBUG = false
const MAX_SIZE = 200
const ELITISM_PERCENT = 0.1
const MUTATION_RATE = 0.3
const CANVAS_WIDTH = 600
const CANVAS_HEIGHT = 700
const TURN_ANGLE = 0.1
const AIR_RESISTENCE = 0.87
const BOOST_FORCE = 0.35
const BREAK_RESISTENCE = 0.05
const SHOW_RACE_LINE = true
const WALL_SIZE = 8
const SEIGHT_PAS = 0.005
const NB_SENSORS = 8

var nextNbPopulation = POPULATION * 1
var world
var db
var counter = 0
var slider, sliderm, log, X_START, Y_START
var circuit
var roads
var best
var selectSize
var selectPopulation
var selectBrain
var training = true
var testCar
var bestBrain
var bestScore = -Infinity
var bestTurns = 0
var bestFrames = 0
var bestNumGen = 0
var nb3Turns = 0
var numGeneration = 0
var winners
var car

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

const chargeCircuit = (init) => {
  noLoop()
  if (car) {
    bestScore = 0
    bestBrain
    bestScore = -Infinity
    bestTurns = 0
    bestFrames = 0
    bestNumGen = 0
    numGeneration = 0
  }
  db.circuits.where('size').equals(DEFAULT_CIRCUIT_SIZE).toArray().then((circuits) => {
    if (!circuits || !circuits.length) {
      console.log(circuits, DEFAULT_CIRCUIT_SIZE)
      alert('Aucun circuit de cette taille...chelou...')
    }
    const dna = random(circuits)
    circuit = new Circuit(X_START, Y_START, DEFAULT_CIRCUIT_SIZE, dna.dna, false, false, dna.id)
    circuit.roadsFromDna()
    if (car) {
      car.reset(X_START, Y_START)
      console.log('START GAMLE')
      loop()
    }
    if (testCar) testCar.reset()

    if (init) {
      car = new Car(X_START, Y_START)
      car.first = true
      loop()
    }

    // selectBrain.elt.innerHTML = ''
    // let brains = []
    // db.brains.where('circuitId').equals(circuit.id).toArray().then((brains_) => {
    //   brains = brains_
    //   brains.sort((a, b) => b.score - a.score)
    //   brains.forEach(b => {
    //     selectBrain.options(b.score)
    //   })
    // })
  })
}

function setup () {
  db = new Dexie("ai-racer")
  db.version(1).stores({
    circuits: 'id,size',
    brains: 'id,circuitId,score'
  })

  frameRate(FRAME_RATE)
  createCanvas(CANVAS_WIDTH, CANVAS_HEIGHT)
  const uiX = CANVAS_WIDTH + 10
  let uiY = 9
  X_START = 0
  Y_START = 0
  log = createDiv('')

  let startButton, stopButton, startTraining, stopTraining

  startButton = createButton('Start')
  startButton.position(uiX, uiY);
  startButton.mousePressed(() => {
    loop();
    stopButton.elt.style.display = 'block'
    startButton.elt.style.display = 'none'
  })
  stopButton = createButton('Pause')
  stopButton.position(uiX, uiY);
  stopButton.mousePressed(() => {
    noLoop();
    startButton.elt.style.display = 'block'
    stopButton.elt.style.display = 'none'
  })
  startButton.elt.style.display = 'none'
  let button = createButton('Reset Frame Rate')
  button.position(uiX, uiY+=40);
  button.mousePressed(() => {
    sliderm.value(1)
  })
  sliderm = createSlider(1, 100, 1)
  sliderm.position(uiX, uiY+=40)
  var p = createP('Taille du circuit')
  p.position(uiX, uiY+=40)
  selectSize = createSelect()
  selectSize.position(uiX, uiY+=40)
  selectSize.changed(() => {
    DEFAULT_CIRCUIT_SIZE = +selectSize.value()
  })
  button = createButton('Change circuit')
  button.position(uiX, uiY+=40)
  button.mousePressed(() => chargeCircuit(true))
  button = createButton('TEST Mode')
  button.position(uiX, uiY+=40);
  button.mousePressed(() => {
    if (!circuit) chargeCircuit(false)
    if (testCar) {
      testCar = null
    } else {
      car = null
      testCar = new Car(X_START, Y_START, null, false, true)
    }
  })
  
  p = createP('Choix du cerveau')
  p.position(uiX, uiY+=40)
  selectBrain = createSelect()
  selectBrain.position(uiX, uiY+=40)

  db.circuits.orderBy('size').uniqueKeys((sizes) => {
    for (let size of sizes) {
      if (!DEFAULT_CIRCUIT_SIZE) DEFAULT_CIRCUIT_SIZE = size
      selectSize.option(size)
    }
  })
  
  p = createP('Traning')
  p.position(uiX, uiY+=40)
  button = createButton()
  button.position(uiX, uiY+=40)
  button.mousePressed(() => {
    training = !training
    if (car) car.training = training
  })

  startTraining = createButton('Start training')
  startTraining.position(uiX, uiY);
  startTraining.mousePressed(() => {
    training = true
    if (car) {
      car.training = true
      car.brain.alpha = 0.5
    }
    stopTraining.elt.style.display = 'block'
    startTraining.elt.style.display = 'none'
  })
  stopTraining = createButton('Stop training')
  stopTraining.position(uiX, uiY);
  stopTraining.mousePressed(() => {
    training = false
    if (car) {
      car.training = false
      car.brain.alpha = 0
    }
    startTraining.elt.style.display = 'block'
    stopTraining.elt.style.display = 'none'
  })
  startTraining.elt.style.display = 'none'

  log = createDiv('LOG')
  log.position(uiX, uiY+=40)

  
  // roads = [
  //   new Road(100, 60)
  // ]
}

var framess = 0
function draw () {
  const maxc = sliderm.value()
  for (let i = 0; i < maxc; i++) {
    if (circuit) {
      if (testCar) {
        testCar.update(circuit)
        circuit.xCar = testCar.position.x
        circuit.yCar = testCar.position.y
      }
      if (car) {
        car.update(circuit)
        if (car.brain.age > 990 && car.brain.age < 1000) {
          sliderm.value(1)
          break;
        }
      }
    }
  }

  background(0)

  if (testCar) {
    log.elt.innerHTML = '<small>FPS multiplieur: ' + maxc + '</small> Tours: ' + testCar.turns +  ' Score: ' + Math.round(testCar.score) + ' Distance:' + Math.round(testCar.distance) + '<br>'
    testCar.chronos.forEach((c, index) => {
      log.elt.innerHTML += '&nbsp;&nbsp;&nbsp;&nbsp;' + c.index + ' -&nbsp;' + c.frames + '<br>'
    })
  } 

  if (circuit) {
    circuit.draw()
    if (car) car.draw()
    if (testCar) testCar.draw()
  }
  if (roads) roads.forEach(r => r.draw())
}

String.prototype.capitalize = function () {
  return this.replace(/\b\w/g, l => l.toUpperCase())
}

function keyPressed () {
  // console.log('keyPressed', keyCode)
  if (!testCar) return
  if (keyCode === LEFT_ARROW) {
    testCar.setRotation(-TURN_ANGLE)
  } else if (keyCode === RIGHT_ARROW) {
    testCar.setRotation(TURN_ANGLE)
  } else if (keyCode === UP_ARROW) {
    testCar.boosting(true)
  } else if (keyCode === DOWN_ARROW) {
    testCar.breaking(true)
  } else if (keyCode === 83) {
    console.log(testCar.think(circuit))
  }
  // return false
}

function keyReleased () {
  if (!testCar) return
  if (keyCode === UP_ARROW) {
    testCar.boosting(false)
  } else if (keyCode === DOWN_ARROW) {
    testCar.breaking(false)
  } else {
    testCar.setRotation(0)
  }
  // return false
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

function normalize (value, min, max) {
  return (value - min) / (max - min);
}

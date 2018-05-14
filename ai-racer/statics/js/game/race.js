const FRAME_RATE = 30
var POPULATION = 200
const DEFAULT_ROAD_WIDTH = 50
var DEFAULT_CIRCUIT_SIZE
const DEBUG = true
const MAX_SIZE = 200
const ELITISM_PERCENT = 0.1
const MUTATION_RATE = 0.3
const CANVAS_WIDTH = 600
const CANVAS_HEIGHT = 700
const TURN_ANGLE = 0.1
const AIR_RESISTENCE = 0.90
const BOOST_FORCE = 0.35
const BREAK_RESISTENCE = 0.05
const SHOW_RACE_LINE = true
const WALL_SIZE = 8
const SEIGHT_PAS = 0.1

var nextNbPopulation = POPULATION * 1
var neat
var db
var counter = 0
var slider, sliderm, log, X_START, Y_START
var circuit
var roads
var best
var selectSize
var selectPopulation
var selectBrain
var testCar
var bestBrain
var bestScore = -Infinity
var bestTurns = 0
var bestFrames = 0
var bestNumGen = 0
var nb3Turns = 0
var numGeneration = 0
var winners
var cars
var showClones = false

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
  if (cars && cars.length) {
    bestScore = 0
    bestBrain
    bestScore = -Infinity
    bestTurns = 0
    bestFrames = 0
    bestNumGen = 0
    numGeneration = 0
  }
  if (POPULATION !== nextNbPopulation) {
    POPULATION = nextNbPopulation
    if (neat) neat = null
    if (cars && cars.length) cars = []
  }
  db.circuits.where('size').equals(DEFAULT_CIRCUIT_SIZE).toArray().then((circuits) => {
    if (!circuits || !circuits.length) {
      console.log(circuits, DEFAULT_CIRCUIT_SIZE)
      alert('Aucun circuit de cette taille...chelou...')
    }
    const dna = random(circuits)
    circuit = new Circuit(X_START, Y_START, DEFAULT_CIRCUIT_SIZE, dna.dna, false, false, dna.id)
    circuit.roadsFromDna()
    if (cars && cars.length) {
      first = null
      if (best) best.reset()
      cars.forEach(c => c.reset(X_START, Y_START))
      console.log('START GAMLE')
      loop()
    }
    if (testCar) testCar.reset()

    if (init) {
      initGeneration()
      startEvaluation(X_START, Y_START)
    }

    selectBrain.elt.innerHTML = ''
    let brains = []
    db.brains.where('circuitId').equals(circuit.id).toArray().then((brains_) => {
      brains = brains_
      brains.sort((a, b) => b.score - a.score)
      brains.forEach(b => {
        selectBrain.options(b.score)
      })
    })
  })
}

function setup () {
  collideDebug(true)
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

  let startButton, stopButton

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
  button = createCheckbox('Show Clones', showClones)
  button.position(uiX, uiY+=40);
  button.changed(() => {
    showClones = !showClones
  })
  sliderm = createSlider(1, 30, 10)
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
  button.mousePressed(chargeCircuit)
  button = createButton('TEST Mode')
  button.position(uiX, uiY+=40);
  button.mousePressed(() => {
    testCar = new Car(X_START, Y_START, null, false, true)
    circuits = []
    cars = null
    neat = null
  })
  button = createButton('Génération Mode')
  button.position(uiX, uiY+=40);
  button.mousePressed(() => {
    initGeneration()
    startEvaluation(X_START, Y_START)
  })
  var p = createP('Nombre de clônes')
  p.position(uiX, uiY+=40)
  selectPopulation = createSelect()
  selectPopulation.position(uiX, uiY+=40)
  selectPopulation.changed(() => {
    nextNbPopulation = +selectPopulation.value()
  })
  selectPopulation.option(50)
  selectPopulation.option(100)
  selectPopulation.option(150)
  selectPopulation.option(200)
  selectPopulation.option(250)
  
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

  log = createDiv('LOG')
  log.position(uiX, uiY+=40)

  
  // roads = [
  //   new Road(100, 60)
  // ]
}

function draw () {
  const maxc = sliderm.value()
  let first
  for (let i = 0; i < maxc; i++) {
    if (circuit) {
      if (testCar) {
        testCar.update(circuit)
        circuit.xCar = testCar.position.x
        circuit.yCar = testCar.position.y
      }
      if (cars) {
        let max = -Infinity
        cars.forEach(c => {
          c.first = false
          c.think(circuit)
          c.update(circuit)
          if (!c.killed && c.score > max) {
            max = c.score
            first = c
          }
        })
        if (first) first.first = true
        const reste = cars.filter(c => !c.killed).length
        if (reste === 0) {
          endEvaluation(X_START, Y_START)
        }
      }
      if (best) {
        best.think(circuit)
        best.update(circuit)
      }
    }
  }

  background(0)
  
  if (neat) {
    log.elt.innerHTML = '<small>FPS multiplieur: ' + maxc + '</small> Frames: ' + frameCount + ' gen: ' + neat.generation + ' Cars:' + cars.length + '<br>'
    if (bestScore) {
      if (bestTurns === 3) {
        log.elt.innerHTML += '<h2>Temps: ' + Math.round(bestFrames / 30) + 's (gen ' +  bestNumGen +  '): ' + bestTurns + ' turns (' + nb3Turns + ')</h2>'
      } else {
        log.elt.innerHTML += '<h2>BEST: ' + Math.round(bestScore) + ' (gen ' +  bestNumGen +  '): ' + bestTurns + ' turns (' + nb3Turns + ')</h2>'
      }
    }
  }
  if (testCar && !neat) {
    log.elt.innerHTML = '<small>FPS multiplieur: ' + maxc + '</small> Tours: ' + testCar.turns +  ' Score: ' + Math.round(testCar.score) + ' Distance:' + Math.round(testCar.distance) + '<br>'
    testCar.chronos.forEach((c, index) => {
      log.elt.innerHTML += '&nbsp;&nbsp;&nbsp;&nbsp;' + c.index + ' -&nbsp;' + c.frames + '<br>'
    })
  } 

  if (circuit) {
    circuit.draw()
    if (cars && (!first || showClones)) cars.forEach(c => c.draw())
    if (first) first.draw()
    if (best) best.draw()
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

function mouseMoved() {
  if (circuit) {
    circuit.checkCar({ position: { x: mouseX, y: mouseY }, crash: () => console.log('TEST CRASH')})
  }
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

const FRAME_RATE = 10
const POPULATION = 250
const DEFAULT_ROAD_LENGTH = 25
const DEFAULT_ROAD_WIDTH = 25
const DEFAULT_CIRCUIT_SIZE = 6
const DEBUG = true
const MAX_SIZE = 200
const ELITISM_PERCENT = 0.1
const MUTATION_RATE = 0.3

var toAdd = ''
var neat
var counter = 0
var size = 4
var slider, sliderm, log, X_START, Y_START
var circuit

function sqr(a) {
  return a*a;
}

function distance(x1, y1, x2, y2) {
  return Math.sqrt(sqr(y2 - y1) + sqr(x2 - x1));
}

function setup () {
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
    document.location.reload()
  })
  button = createButton('Reset Frame Rate')
  button.position(1050, 129);
  button.mousePressed(() => {
    slider.value(1)
    sliderm.value(1)
  })
  test = new Circuit (100, 100, 12, null)
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

function draw () {
  background(0)
  test.draw()
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
  if (code) test.addRoad(code)
}

function getNextDirection (inverse, dir) {
  let next
  switch (inverse) {
    case 'up':
      switch (dir) {
        case 'left':
          next = 'Right'
          break;
        case 'right':
          next = 'Left'
          break;
        default:
          next = 'Down'
          break;
      }
      break;
    case 'down':
      switch (dir) {
        case 'left':
          next = 'Left'
          break;
        case 'right':
          next = 'Right'
          break;
        default:
          next = 'Up'
          break;
      }
      break;
    case 'left':
      switch (dir) {
        case 'left':
          next = 'Up'
          break;
        case 'right':
          next = 'Down'
          break;
        default:
          next = 'Right'
          break;
      }
      break;
    case 'right':
      switch (dir) {
        case 'left':
          next = 'Down'
          break;
        case 'right':
          next = 'Up'
          break;
        default:
          next = 'Left'
          break;
      }
      break;
  }
  return next
}

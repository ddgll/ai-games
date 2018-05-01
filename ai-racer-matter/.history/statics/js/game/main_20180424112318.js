const POPULATION = 2
const DEFAULT_ROAD_LENGTH = 25
const DEFAULT_ROAD_WIDTH = 25
const DEFAULT_CIRCUIT_SIZE = 4
const DEBUG = true

var counter = 0
var size = 4
var slider, sliderm, log, circuits, dead, roads

function sqr(a) {
  return a*a;
}

function distance(x1, y1, x2, y2) {
  return Math.sqrt(sqr(y2 - y1) + sqr(x2 - x1));
}

function setup () {
  frameRate(30)
  createCanvas(1000, 800)
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
  dead = []
  circuits = []
  let x = 10, y = 10
  for (let i = 0; i < POPULATION; i++) {
    circuits.push(new Circuit (x, y, 8))
    x += 100
    if (i % 5 && x > 110) {
      x = 10
      y += 100
    }
  }
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
  log.elt.innerHTML = '<small>FPS multiplieur: ' + maxc + '</small> Frames: ' + counter + ' fr: ' + frameRate()
  for (let i = 0; i < maxc; i++) {
    counter++
    circuits.forEach((circuit, index) => {
      circuit.update()
    })
    dead = circuits.filter(c => c.dead)
    circuits = circuits.filter(c => !c.dead)
  }
  background(0)
  circuits.forEach(circuit => circuit.draw())
  roads.forEach(road => road.draw())
}

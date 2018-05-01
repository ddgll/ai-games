const POPULATION = 200
const DEFAULT_ROAD_LENGTH = 25
const DEFAULT_ROAD_WIDTH = 25

var counter = 0
var size = 4
var slider, sliderm, log, roads

function sqr(a) {
  return a*a;
}

function distance(x1, y1, x2, y2) {
  return Math.sqrt(sqr(y2 - y1) + sqr(x2 - x1));
}

function setup () {
  frameRate(30)
  createCanvas(600, 600)
  log = createDiv('')

  slider = createSlider(1, 100, 1)
  sliderm = createSlider(1, 20, 1)
  log = createDiv('LOG')
  let button = createButton('START')
  button.position(650, 9);
  button.mousePressed(() => {
    loop();
  })
  button = createButton('STOP')
  button.position(650, 49);
  button.mousePressed(() => {
    noLoop();
  })
  roads = [
    new Road(10, 10, 'horizontal'),
    new Road(60, 10, 'vertical'),
    new Road(110, 10, 'leftUp'),
    new Road(160, 10, 'leftDown'),
    new Road(210, 10, 'rightUp'),
    new Road(260, 10, 'rightDown')
  ]
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
  }

  background(0)
  roads.forEach(road => road.draw())
}

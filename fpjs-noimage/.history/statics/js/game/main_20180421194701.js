const POPULATION = 200
const PIPE_APPAIRS = 120

var best = null
var bestScore = 0
var birds = []
var dead = []
var pipes = []
var counter = 0
var slider
var pipe_appairs
var log
var showb = true
var showclones = true
var hard = false
var shard = false

function sqr(a) {
  return a*a;
}

function distance(x1, y1, x2, y2) {
  return Math.sqrt(sqr(y2 - y1) + sqr(x2 - x1));
}

function setup () {
  createCanvas(600, 600)
  slider = createSlider(1, 1000, 1)
  const saved = localStorage.getItem('bestbrain')
  const bsaved = localStorage.getItem('bestscore')
  if (bsaved && bsaved > 10000) {
    hard = true
    bestScore = 10001
  }
  if (bsaved && bsaved > 100000) {
    shard = true
    bestScore = 100001
  }
  let brain
  try {
    brain = saved ? neataptic.Network.fromJSON(JSON.parse(saved)) : null
    if (brain) best = new Bird(brain, null, true)
  } catch(e) {
    console.error('FAILED TO Load best', e)
  }
  for(let i = 0; i < POPULATION; i++) birds.push(new Bird(brain))
  log = createDiv('LOG')
  var buttons = createButton('START')
  buttons.position(650, 9);
  buttons.mousePressed(() => {
    loop();
  })
  button = createButton('STOP')
  button.position(650, 49);
  button.mousePressed(() => {
    noLoop();
  })
  button = createButton('SHOW BEST')
  button.position(650, 89);
  button.mousePressed(() => {
    best.killed = false
    showb = !showb
  })
  button = createButton('SHOW CLONES')
  button.position(650, 129);
  button.mousePressed(() => {
    showclones = !showclones
  })
}

function draw () {
  pipe_appairs = PIPE_APPAIRS
  if (!hard) pipe_appairs += 100
  for (let i = 0; i < slider.value(); i++) {
    if (counter > 10000) hard = true
    if (counter > 100000) shard = true
    log.elt.innerHTML = counter + ' h(' + hard + ') : ' + ' sh(' + shard + ') : ' + birds.length + ''
    if (counter++ % PIPE_APPAIRS === 0) {
      pipes.push(new Pipe())
    }

    pipes.forEach((p) => {
      p.update()
      birds.forEach(bird => {
        if (p.hits(bird)) bird.killed = true
      })
      if (p.hits(best)) best.killed = true
    })
    
    if (best) {
      best.think(pipes)
      best.update()
    }

    birds.forEach((bird) => {
      bird.think(pipes)
      bird.update()
    })

    if (birds.length < POPULATION*0.05 && bestScore > 200000) {
      birds.forEach(bird => {
        bird.killed = true
      })
      best.killed = true
    }

    pipes = pipes.filter(p => !p.offscreen())
    dead = dead.concat(birds.filter(b => b.killed))
    birds = birds.filter(b => !b.killed)

    if (birds.length === 0) {
      counter = 0
      pipes = []
      if (bestScore < 10000) {
        hard = false
        shard = false
      }
      nextGeneration()
    }
  }

  background(0)
  pipes.forEach(p => p.show())
  if (best && !best.killed && showb) {
    best.show(true)
  }
  if (showclones) {
    birds.forEach(b => b.show())
  }
}

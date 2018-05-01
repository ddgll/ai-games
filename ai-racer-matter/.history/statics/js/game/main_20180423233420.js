const POPULATION = 200
const PIPE_APPAIRS = 120
const POINTS_VELOCITY = 2

var counter = 0
var size = 4
var slider, sliderm, log

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
  sliderm = createSlider(1, 20, 10)
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
  pipe_appairs = PIPE_APPAIRS
  const maxc = slider.value() * sliderm.value()
  if (!hard) pipe_appairs += 100
  if (shard) pipe_appairs -= 50
  log.elt.innerHTML = '<small>FPS multiplieur: ' + maxc + '</small> Frames: ' + counter + ' h(' + hard + ') : ' + ' sh(' + shard + ') birds: ' + birds.length + ' gen: ' + numGeneration + ' fr: ' + frameRate() + '<br>' + 
    '<h1>BEST: ' + toDate(bfrs) + ' Génération: ' + bestnumgen + '<h1>'
  for (let i = 0; i < maxc; i++) {
    if (counter++ % pipe_appairs === 0) {
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

    let bmax, max = 0
    birds.forEach((bird) => {
      bird.first = false
      if (bird.score > max) {
        bmax = bird
        max = bird.score
      }
      bird.think(pipes)
      bird.update()
    })
    if (bmax) bmax.first = true

    // if (birds.length < POPULATION*0.1 && bestScore > 2000000) {
    //   birds.forEach(bird => {
    //     bird.killed = true
    //   })
    //   best.killed = true
    // }

    pipes = pipes.filter(p => !p.offscreen())
    dead = dead.concat(birds.filter(b => b.killed))
    birds = birds.filter(b => !b.killed)

    if (birds.length === 0) {
      counter = 0
      pipes = []
      nextGeneration()
    }
  }

  background(0)
  pipes.forEach(p => p.show())
  if (best && !best.killed && showb) {
    best.show(true)
  }
  birds.forEach(b => (b.first || showclones) ? b.show() : null)
}

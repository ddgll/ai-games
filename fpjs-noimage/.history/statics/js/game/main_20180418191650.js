const POPULATION = 500
const PIPE_APPAIRS = 200

var best = null
var bestScore = 0
var birds = []
var dead = []
var pipes = []
var counter = 0
var slider

function setup () {
  createCanvas(400, 600)
  slider = createSlider(1, 100, 1)
  const saved = localStorage.getItem('bestbrain')
  let brain
  try {
    brain = saved ? neataptic.Network.fromJSON(JSON.parse(saved)) : null
    if (brain) best = new Bird(brain, null, true)
  } catch(e) {
    console.error('FAILED TO Load best', e)
  }
  for(let i = 0; i < POPULATION; i++) birds.push(new Bird(brain))
}

function draw () {
  for (let i = 0; i < slider.value(); i++) {
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
      best.show(true)
    }

    birds.forEach((bird) => {
      bird.think(pipes)
      bird.update()
    })

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
  // birds.forEach(b => b.show())
  pipes.forEach(p => p.show())
}

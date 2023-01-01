const POPULATION = 250
const PIPE_APPAIRS = 200

var best = null
var birds = []
var dead = []
var pipes = []
var counter = 0
var slider

function setup () {
  console.log('PASS ICI')
  createCanvas(400, 600)
  slider = createSlider(1, 100, 1)
  for(let i = 0; i < POPULATION; i++) birds.push(new Bird())
  pipes.push(new Pipe())
}

function draw () {
  for (let i = 0; i < slider.value(); i++) {
    birds.forEach((bird) => {
      bird.think(pipes)
      bird.update()
    })

    if (counter++ % PIPE_APPAIRS === 0) {
      pipes.push(new Pipe())
    }

    pipes.forEach((p) => {
      p.update()
      birds.forEach(bird => {
        if (p.hits(bird)) bird.killed = true
      })
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
  birds.forEach(b => b.show())
  pipes.forEach(p => p.show())
}

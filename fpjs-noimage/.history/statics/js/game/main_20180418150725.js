const POPULATION = 250
const PIPE_APPAIRS = 200

var birds = []
var dead = []
var pipes = []

function setup () {
  console.log('PASS ICI')
  createCanvas(400, 600)
  for(let i = 0; i < POPULATION; i++) birds.push(new Bird())
  pipes.push(new Pipe())
}

function draw () {
  background(0)

  birds.forEach((bird) => {
    bird.think(pipes)
    bird.update()
    bird.show()
  })

  if (birds.length === 0) nextGeneration()

  if (frameCount % PIPE_APPAIRS === 0) {
    pipes.push(new Pipe())
  }

  pipes.forEach((p) => {
    p.show()
    p.update()
    birds.forEach(bird => {
      if (p.hits(bird)) bird.killed = true
    })
  })
  pipes = pipes.filter(p => !p.offscreen())
  dead = dead.concat(birds.filter(b => b.killed))
  birds = birds.filter(b => !b.killed)
}

function keyPressed () {
  if (key === ' ') {
    bird.up()
  }
}

const POPULATION = 250
const PIPE_APPAIRS = 200

var birds = []
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

  if (frameCount % PIPE_APPAIRS === 0) {
    pipes.push(new Pipe())
  }

  pipes.forEach((p) => {
    p.show()
    p.update()
    // if (p.hits(bird)) bird.stop()
  })
  pipes = pipes.filter(p => !p.offscreen())
}

function keyPressed () {
  if (key === ' ') {
    bird.up()
  }
}

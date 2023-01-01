var bird
var pipes = []

const PIPE_APPAIRS = 200

function setup () {
  console.log('PASS ICI')
  createCanvas(400, 600)
  bird = new Bird()
  pipes.push(new Pipe())
}

function draw () {
  background(0)

  bord.think(pipes)
  bird.update()
  bird.show()

  if (frameCount % PIPE_APPAIRS === 0) {
    pipes.push(new Pipe())
  }

  pipes.forEach((p) => {
    p.show()
    p.update()
    if (p.hits(bird)) bird.stop()
  })
  pipes = pipes.filter(p => !p.offscreen())
}

function keyPressed () {
  if (key === ' ') {
    bird.up()
  }
}

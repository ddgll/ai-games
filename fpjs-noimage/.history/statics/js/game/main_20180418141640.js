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
  bird.update()
  bird.show()

  if (frameCount % PIPE_APPAIRS === 0) {
    pipes.push(new Pipe())
  }

  pipes.forEach((p) => {
    p.show()
    p.update()
  })
}

function keyPressed () {
  if (key === ' ') {
    bird.up()
  }
}

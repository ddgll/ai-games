var bird
var pipes = []

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

var bird

function setup () {
  console.log('PASS ICI')
  createCanvas(400, 600)
  bird = new Bird()
}

function draw () {
  background(0)
  bird.update()
  bird.show()
}
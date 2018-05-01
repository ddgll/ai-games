const PIPE_APPAIRS = 25
const IMAGE_SIZE = 12
const MEMORY_LENGTH = 4
const BACKGROUND = 0


var nodes = IMAGE_SIZE*IMAGE_SIZE

var sketch = function (brain, id, dead, games) {
  var bird
  var memory = []
  var counter = 0
  var pipes = []
  var log = document.getElementById('log' + id)
  return function (p) {
    games.push(p)
    p.setup = function () {
      p.createCanvas(70, 50)
      bird = new Bird(brain, null, p, log)
    }
      
    p.draw = function () {
      const img = p.get()
      img.resize(IMAGE_SIZE, IMAGE_SIZE)
      img.loadPixels()
      const inputs = img.pixels.map(p => p / 255.0)
      memory.push(inputs)
      if (memory.length > MEMORY_LENGTH) memory = memory.slice(memory.length - MEMORY_LENGTH)
      
      if (counter++ % PIPE_APPAIRS === 0) pipes.push(new Pipe(p))
      pipes.forEach((p) => {
        p.update()
        p.hits(bird)
      })
      bird.think(memory)
      bird.update()
      pipes = pipes.filter(p => !p.offscreen())
      p.background(0)
      pipes.forEach(p => p.show())
      if (bird && !bird.killed) {
        bird.show(true)
      }
      if (bird.killed) {
        p.noLoop()
        dead(bird)
      }
    }

    p.mouseClicked = function () {
      console.log('KEY PRESSED', bird.killed)
      if (bird.killed) {
        bird.killed = false
        bird.x = p.height/2
      }
      bird.up()
    }
  }
}

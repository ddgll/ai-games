const PIPE_APPAIRS = 100
const IMAGE_SIZE = 28
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
      p.createCanvas(100, 75)
      bird = new Bird(brain, null, p, log)
    }
      
    p.draw = function () {
      var img = p.get()
      var inputs = []
      img.resize(IMAGE_SIZE, IMAGE_SIZE)
      img.loadPixels()
      for (let i = 0; i < IMAGE_SIZE * IMAGE_SIZE; i++) {
        inputs[i] = img.pixels[i] / 255.0
      }
      memory.push(inputs)
      if (memory.length > MEMORY_LENGTH) {
        memory = memory.slice(memory.length - MEMORY_LENGTH)
      }
      if (counter++ % PIPE_APPAIRS === 0) {
        pipes.push(new Pipe(p))
      }
    
      pipes.forEach((p) => {
        p.update()
        if (p.hits(bird)) bird.killed = true
      })
      
      bird.think(memory)
      bird.update()
    
      pipes = pipes.filter(p => !p.offscreen())
    
      p.background(0, 99.99)
      pipes.forEach(p => p.show())
      if (bird && !bird.killed) {
        bird.show(true)
      }

      if (bird.killed) {
        p.noLoop()
        dead(bird)
      }
    }
  }
}

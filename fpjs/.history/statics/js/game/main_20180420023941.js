const PIPE_APPAIRS = 100
const IMAGE_SIZE = 16
const MEMORY_LENGTH = 4
const BACKGROUND = 0


var nodes = IMAGE_SIZE*IMAGE_SIZE

var sketch = function (brain, id, dead) {
  var bird
  var memory = []
  var counter = 0
  var pipes = []
  var log = document.getElementById('log' + id)
  return function (p) {
    p.setup = function () {
      p.createCanvas(100, 75)
      var buttons = p.createButton('START')
      buttons.position(500, 9);
      buttons.mousePressed(() => {
        p.loop();
      })
      button = p.createButton('STOP')
      button.position(500, 49);
      button.mousePressed(() => {
        p.noLoop();
      })
      bird = new Bird(brain, null, p, log)
    }
      
    p.draw = function () {
      var img = p.get()
      var inputs = []
      img.resize(28, 28)
      img.loadPixels()
      for (let i = 0; i < 28 * 28; i++) {
        let bright = img.pixels[i * 4]
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

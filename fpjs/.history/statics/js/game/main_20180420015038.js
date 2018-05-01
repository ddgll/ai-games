const POPULATION = 2
const PIPE_APPAIRS = 100
const IMAGE_SIZE = 16
const MEMORY_LENGTH = 4
const BACKGROUND = 0

var best = null
var bestScore = 0
var birds = []
var dead = []
var nodes = IMAGE_SIZE*IMAGE_SIZE

var sketch = function (brain, id) {
  var bird
  var memory = []
  var counter = 0
  var pipes = []
  var vision
  var log = document.getElementById('log' + id)
  return function (p) {
    p.setup = function () {
      p.createCanvas(200, 150)
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
        inputs[i] = (255 - bright) / 255.0
      }
      memory.push(inputs)
      if (memory.length > MEMORY_LENGTH) {
        memory = memory.slice(memory.length - MEMORY_LENGTH)
      }
      vision = addFrames()
      if (counter++ % PIPE_APPAIRS === 0) {
        pipes.push(new Pipe(p))
      }
    
      pipes.forEach((p) => {
        p.update()
        if (p.hits(bird)) bird.killed = true
      })
      
      bird.think(vision)
      bird.update()
    
      pipes = pipes.filter(p => !p.offscreen())
    
      p.background(0, 99.99)
      pipes.forEach(p => p.show())
      if (bird && !bird.killed) {
        bird.show(true)
      }
    }
    
    function addFrames () {
      let v = []
      // console.log(vision)
      const line = IMAGE_SIZE * 4
      memory.forEach(frame => {
        if (!v) v = frame
        v = v.map((pixel, index) => pixel === BACKGROUND ? frame[index] : pixel)
        })
        // v = v ? v.add(frame, false) : frame
      })
      return v
    }
  }
}

new p5(sketch(null, '1'), '1')

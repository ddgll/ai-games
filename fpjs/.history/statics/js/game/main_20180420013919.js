const POPULATION = 2
const PIPE_APPAIRS = 200
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
  var log
  return function (p) {
    p.setup = function () {
      game = createCanvas(100, 150)
      var buttons = createButton('START')
      buttons.position(500, 9);
      buttons.mousePressed(() => {
        loop();
      })
      button = createButton('STOP')
      button.position(500, 49);
      button.mousePressed(() => {
        noLoop();
      })
      button = createButton('SHOW BEST')
      button.position(500, 89);
      button.mousePressed(() => {
        showb = !showb
      })
      button = createButton('SHOW CLONES')
      button.position(500, 129);
      button.mousePressed(() => {
        showclones = !showclones
      })
      bird = new Bird(brain, null, log)
    }
      
    p.draw = function () {
      var img = get()
      var inputs
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
        pipes.push(new Pipe())
      }
    
      pipes.forEach((p) => {
        p.update()
        if (p.hits(bird)) bird.killed = true
      })
      
      bird.think(vision)
      bird.update()
    
      pipes = pipes.filter(p => !p.offscreen())
    
      background(0, 99.99)
      pipes.forEach(p => p.show())
      if (bird && !bird.killed) {
        bird.show(true)
      }
    }
    
    function addFrames () {
      let v = null
      // console.log(vision)
      const left = Math.round(IMAGE_SIZE*4*0.2)
      const line = IMAGE_SIZE * 4
      memory.forEach(frame => {
        if (!v) v = frame
        v = v.map((pixel, index) => {
          if (pixel === BACKGROUND) return frame[index]
          if (index % line < left) return BACKGROUND
          return pixel
        })
        // v = v ? v.add(frame, false) : frame
      })
      return v ? v.tolist() : []
    }
  }
}

new p5(sketch(null, '1'), '1')

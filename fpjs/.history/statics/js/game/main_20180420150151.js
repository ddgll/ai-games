const PIPE_APPAIRS = 30
const IMAGE_SIZE = 12
const MEMORY_LENGTH = 10
const BACKGROUND = 0


var nodes = IMAGE_SIZE*IMAGE_SIZE

var sketch = function (brain, id, dead, best) {
  var bird
  var memory = []
  var counter = 0
  var log
  return function (p) {
    games.push(p)
    p.setup = function () {
      log = p.createDiv()
      p.createCanvas(70, 50)
      bird = new Bird(brain, p, log, best)
      p.bird = bird
    }
      
    p.draw = function () {
      if (counter % 5 === 0) {
        const img = p.get()
        img.resize(IMAGE_SIZE, IMAGE_SIZE)
        img.loadPixels()
        const inputs = img.pixels.map(p => p / 255.0)
        memory.push(inputs)
        if (memory.length > MEMORY_LENGTH) memory = memory.slice(memory.length - MEMORY_LENGTH)
      }

      if (best) {
        pipes.forEach(pi => pi.update(pi))
        pipes = pipes.filter(pi => !pi.offscreen())
        if (counter++ % PIPE_APPAIRS === 0) pipes.push(new Pipe(p))
        // var be, bes = 0
        // games.forEach(ga => {
        //   if (!ga.bird) return
        //   ga.bird.first = false
        //   if (ga.bird.score > bes) {
        //     bes = ga.bird.score
        //     be = ga.bird
        //   }
        // })
        // if (be) be.first = true
      }
      
      pipes.forEach((pi) => pi.hits(bird))
      bird.think(memory)
      bird.update()
      
      p.background(0)
      pipes.forEach(pi => pi.show(p))
      if (bird && !bird.killed) {
        bird.show(best)
      }
      if (bird.killed) {
        if (best) {
          bird.reset()
        } else {
          p.noLoop()
          dead(bird)
        }
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

const POPULATION = 2
const PIPE_APPAIRS = 200
const IMAGE_SIZE = 16
const MEMORY_LENGTH = 4
const BACKGROUND = 0

var best = null
var bestScore = 0
var birds = []
var dead = []
var pipes = []
var memory = []
var counter = 0
var game
var vision
var showb = true
var showclones = true
var reshapeGroup = 0
var nodes = 0
var log
var logVision

function reducea (a, n_averaged_elements) {
  averaged_array = []
  for(let i = 0; i < a.length; i += n_averaged_elements) {
    slice_from_index = i
    slice_to_index = slice_from_index + n_averaged_elements
    averaged_array = averaged_array.concat(nj.mean(a.slice(slice_from_index, slice_to_index)))
  }
  return averaged_array
}

var sketch = function (p) {
  p.setup = function () {
    nodes = IMAGE_SIZE*IMAGE_SIZE
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
    const saved = localStorage.getItem('bestbrain')
    let brain
    try {
      brain = saved ? neataptic.Network.fromJSON(JSON.parse(saved)) : null
      if (brain && false) {
        best = new Bird(brain, null, true)
      } else {
        best = new Bird(null, null, true)
      }
    } catch(e) {
      console.error('FAILED TO Load best', e)
    }
    for(let i = 0; i < POPULATION; i++) birds.push(new Bird(brain))
    logVision = createDiv('LOGVISION')
    log = createDiv('LOG')
    logVision.elt.style.fontSize = '9px'
  }
  
  
  
  p.draw = function () {
    log.elt.innerHTML = ''
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
      birds.forEach(bird => {
        if (p.hits(bird)) bird.killed = true
      })
      if (p.hits(best)) best.killed = true
    })
    
    if (best) {
      best.think(vision, true)
      best.update(true)
    }
  
    birds.forEach((bird) => {
      bird.think(vision)
      bird.update()
    })
  
    pipes = pipes.filter(p => !p.offscreen())
    dead = dead.concat(birds.filter(b => b.killed))
    birds = birds.filter(b => !b.killed)
  
    if (birds.length === 0) {
      counter = 0
      pipes = []
      memory = []
      nextGeneration()
    }
  
    background(0, 99.99)
    pipes.forEach(p => p.show())
    if (showclones) birds.forEach(b => b.show())
    if (best && !best.killed && showb) {
      best.show(true)
    }
    // log.elt.innerHTML += 'BIRDS: ' + birds.length + '<br>'
    // log.elt.innerHTML += 'DEAD: ' + dead.length + '<br>'
  }
  
  function addFrames () {
    let v = null
    // console.log(vision)
    const left = Math.round(IMAGE_SIZE*4*0.2)
    const line = IMAGE_SIZE * 4
    memory.forEach(frame => {
      if (!v) v = frame
      v.selection.data = v.selection.data.map((pixel, index) => {
        if (pixel === BACKGROUND) return frame.selection.data[index]
        if (index % line < left) return BACKGROUND
        return pixel
      })
      // v = v ? v.add(frame, false) : frame
    })
    if (v && counter % 10 === 0) {
      // console.log('SET VISION', nj.uint8(v).reshape(IMAGE_SIZE, IMAGE_SIZE, 4))
      var ca = document.getElementById('resized')
      nj.images.save(nj.uint8(v).reshape(IMAGE_SIZE, IMAGE_SIZE, 4), ca)
    }
    return v ? v.tolist() : []
  }  
}


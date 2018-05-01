const POPULATION = 10
const PIPE_APPAIRS = 200
const IMAGE_SIZE = 16
const MEMORY_LENGTH = 10
const BACKGROUND = 0
const CBALLS = 164
const CBEST = 150

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
var showclones = false

function setup () {
  var ca = document.getElementById('resized')
  ca.width = IMAGE_SIZE
  ca.height = IMAGE_SIZE
  game = createCanvas(400, 600)
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
    if (brain) best = new Bird(brain, null, true)
  } catch(e) {
    console.error('FAILED TO Load best', e)
  }
  for(let i = 0; i < POPULATION; i++) birds.push(new Bird(brain))
}



function draw () {
  var img = nj.images.read(game.canvas)
  var resized = nj.images.resize(img, IMAGE_SIZE, IMAGE_SIZE)
  if (JSON.stringify(resized.shape) === `[${IMAGE_SIZE},${IMAGE_SIZE}]`) {
    memory.push(resized.flatten())
  }
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
    best.think(vision)
    best.update()
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
    nextGeneration()
  }

  background(0)
  pipes.forEach(p => p.show())
  if (showclones) birds.forEach(b => b.show())
  if (best && !best.killed && showb) {
    best.show(true)
  }
}

function addFrames () {
  let v = null
  // console.log(vision)
  memory.forEach(frame => {
    if (!v) v = frame
    v.selection.data.forEach((pixel, index) => {
      if (pixel === BACKGROUND) {
        v.selection.data[index] = frame.selection.data[index]
      }
      if (index % IMAGE_SIZE < 8) v.selection.data[index] = BACKGROUND
    })
    // vision = vision ? vision.add(frame, false) : frame
  })
  if (v) {
    // console.log('SET VISION', nj.uint8(v).reshape(IMAGE_SIZE, IMAGE_SIZE))
    var ca = document.getElementById('resized')
    nj.images.save(nj.uint8(v).reshape(IMAGE_SIZE, IMAGE_SIZE), ca)
  }
  return v
}

const POPULATION = 500
const PIPE_APPAIRS = 200

var best = null
var bestScore = 0
var birds = []
var dead = []
var pipes = []
var counter = 0
var slider

function setup () {
  createCanvas(400, 600)
  slider = createSlider(1, 100, 1)
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
  for (let i = 0; i < slider.value(); i++) {
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
      best.think(pipes)
      best.update()
    }

    birds.forEach((bird) => {
      bird.think(pipes)
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
  }

  background(0)
  pipes.forEach(p => p.show())
  if (best && !best.killed) {
    best.show(true)
  } else {
    birds.forEach(b => b.show())
  }
}

function keyPressed () {
  saveFrames('out', 'png', 1, 3, (data) => {
    console.log('SAVE FRAME DATA', data)
    nj.config.printThreshold = 28
    var $img = new Image()
    $img.onload = function (i) {
      console.log('loaded', i)
      var img = nj.images.read($img)
      var resized = nj.images.resize(img, 28, 28)
      console.log(resized)
      var ca = document.getElementById('resized')
      ca.width = 28
      ca.height = 28
      nj.images.save(resized, ca)
    }
    $img.src = data[0].imageData
    // var img = nj.images.read(data[0].imageData)
  })
}

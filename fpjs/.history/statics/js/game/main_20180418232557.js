const POPULATION = 500
const PIPE_APPAIRS = 200

var best = null
var bestScore = 0
var birds = []
var dead = []
var pipes = []
var memory = []
var counter = 0
var slider
var game
var vision

function setup () {
  var ca = document.getElementById('resized')
  ca.width = 28
  ca.height = 28
  game = createCanvas(400, 600)
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
  if (counter > 3) {
    var img = nj.images.read(game.canvas)
    var resized = nj.images.resize(img, 28, 28)
    console.log(resized)
    memory.push(resized)
    if (memory.length > 10) {
      memory = memory.slice(10)
    }
    addFrames ()
  }
  
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
      best.think(pipes, vision)
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

function addFrames () {
  vision = null
  memory.forEach(frame => {
    console.log(typeof frame)
    if (!vision) {
      vision = frame
    } else {
      vision = vision.add(frame, false)
    }
  })
  if (vision) {
    var ca = document.getElementById('resized')
    nj.images.save(vision, ca)
    vision = nj.sigmoid(vision).flatten()
  }
}

function keyPressed () {
  // saveFrames('out', 'png', 1, 15, (frames) => {
  //   console.log('SAVE FRAME DATA')
  //   nj.config.printThreshold = 28
  //   const resized = []
  //   let frame
  //   const endFrames = () => {
  //     if (resized.length === 3) {
  //       var ca = document.getElementById('resized')
  //       ca.width = 28
  //       ca.height = 28
  //       var proceed = null
  //       var iid = 1
  //       for (var ii of resized) {
  //         var rr = document.getElementById('fr' + iid++)
  //         rr.width = 28
  //         rr.height = 28
  //         nj.images.save(ii, rr)
  //         if (!proceed) {
  //           proceed = ii
  //         } else {
  //           proceed = proceed.add(ii, false)
  //         }
  //       }
  //       // var proceed = resized.reduce((a, b) => a.add(b, false))
  //       console.log('SAVE IMAGE', proceed)
  //       nj.images.save(proceed, ca)
  //     } else {
  //       console.log('NOT YET', resized.length)
  //     }
  //   }
  //   for (let i in frames) {
  //     if (i % 7 === 0) {
  //       frame = frames[i]
  //       var $img = new Image()
  //       $img.onload = function (i) {
  //         var img = nj.images.read($img)
  //         resized.push(nj.images.resize(img, 28, 28))
  //         endFrames()
  //       }
  //       $img.src = frame.imageData
  //     }
  //   }
    
  //   // var img = nj.images.read(data[0].imageData)
  // })
}

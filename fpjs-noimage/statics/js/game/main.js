const POPULATION = 200
const PIPE_APPAIRS = 120
const POINTS_VELOCITY = 2

// 1000000 bestbrain : {"nodes":[{"bias":0,"type":"input","squash":"LOGISTIC","mask":1,"index":0},{"bias":0,"type":"input","squash":"LOGISTIC","mask":1,"index":1},{"bias":0,"type":"input","squash":"LOGISTIC","mask":1,"index":2},{"bias":0,"type":"input","squash":"LOGISTIC","mask":1,"index":3},{"bias":0,"type":"input","squash":"LOGISTIC","mask":1,"index":4},{"bias":0,"type":"input","squash":"LOGISTIC","mask":1,"index":5},{"bias":0,"type":"input","squash":"LOGISTIC","mask":1,"index":6},{"bias":0,"type":"input","squash":"LOGISTIC","mask":1,"index":7},{"bias":0,"type":"input","squash":"LOGISTIC","mask":1,"index":8},{"bias":0,"type":"input","squash":"LOGISTIC","mask":1,"index":9},{"bias":0,"type":"input","squash":"LOGISTIC","mask":1,"index":10},{"bias":0,"type":"input","squash":"LOGISTIC","mask":1,"index":11},{"bias":0,"type":"input","squash":"LOGISTIC","mask":1,"index":12},{"bias":-4.04319824476935,"type":"hidden","squash":"BENT_IDENTITY","mask":1,"index":13},{"bias":3.965161778022406,"type":"hidden","squash":"LOGISTIC","mask":1,"index":14},{"bias":-0.024903439043160613,"type":"hidden","squash":"LOGISTIC","mask":1,"index":15},{"bias":4.459102946814019,"type":"hidden","squash":"BENT_IDENTITY","mask":1,"index":16},{"bias":20.90010056134024,"type":"hidden","squash":"TANH","mask":1,"index":17},{"bias":6.89794047518409,"type":"hidden","squash":"SINUSOID","mask":1,"index":18},{"bias":4.712780400657457,"type":"hidden","squash":"BENT_IDENTITY","mask":1,"index":19},{"bias":2.360950734628244,"type":"hidden","squash":"BENT_IDENTITY","mask":1,"index":20},{"bias":5.984719494511575,"type":"output","squash":"RELU","mask":1,"index":21}],"connections":[{"weight":1.3046508151088858,"from":20,"to":21,"gater":null},{"weight":-1.4719492135942773,"from":19,"to":21,"gater":null},{"weight":0.7942225532534488,"from":18,"to":21,"gater":null},{"weight":-1.766236023824728,"from":17,"to":21,"gater":null},{"weight":-2.797273574355064,"from":15,"to":21,"gater":null},{"weight":-1.6320520441770618,"from":14,"to":21,"gater":null},{"weight":5.168947992813509,"from":12,"to":21,"gater":null},{"weight":0.41987298012624574,"from":16,"to":17,"gater":null},{"weight":5.807016424645144,"from":11,"to":21,"gater":null},{"weight":-1.7875297680207107,"from":10,"to":21,"gater":null},{"weight":0.8620150269174012,"from":9,"to":21,"gater":null},{"weight":2.225029050103327,"from":8,"to":21,"gater":null},{"weight":-3.39114736466382,"from":14,"to":15,"gater":null},{"weight":-2.7914120245993193,"from":6,"to":21,"gater":null},{"weight":3.4717349814593064,"from":13,"to":14,"gater":null},{"weight":-1.0009493938564398,"from":4,"to":21,"gater":null},{"weight":6.505150009374003,"from":7,"to":18,"gater":null},{"weight":-3.3626112796208565,"from":9,"to":15,"gater":null},{"weight":-1.984780802582097,"from":11,"to":13,"gater":null},{"weight":6.604592401233032,"from":2,"to":21,"gater":null},{"weight":3.8878037595563377,"from":8,"to":15,"gater":null},{"weight":-0.049105163407712205,"from":1,"to":21,"gater":null},{"weight":2.833802362984874,"from":2,"to":20,"gater":null},{"weight":5.1108144625523355,"from":3,"to":19,"gater":null},{"weight":-2.5264959745367883,"from":6,"to":16,"gater":null},{"weight":10.03389614009276,"from":0,"to":20,"gater":null},{"weight":2.2327970918381497,"from":5,"to":14,"gater":null},{"weight":-0.3337939812684312,"from":5,"to":13,"gater":null},{"weight":1.6682224780951946,"from":1,"to":14,"gater":null}],"input":13,"output":1,"dropout":0}
// 2000000 bestbrain : {"nodes":[{"bias":0,"type":"input","squash":"LOGISTIC","mask":1,"index":0},{"bias":0,"type":"input","squash":"LOGISTIC","mask":1,"index":1},{"bias":0,"type":"input","squash":"LOGISTIC","mask":1,"index":2},{"bias":0,"type":"input","squash":"LOGISTIC","mask":1,"index":3},{"bias":0,"type":"input","squash":"LOGISTIC","mask":1,"index":4},{"bias":0,"type":"input","squash":"LOGISTIC","mask":1,"index":5},{"bias":0,"type":"input","squash":"LOGISTIC","mask":1,"index":6},{"bias":0,"type":"input","squash":"LOGISTIC","mask":1,"index":7},{"bias":0,"type":"input","squash":"LOGISTIC","mask":1,"index":8},{"bias":0,"type":"input","squash":"LOGISTIC","mask":1,"index":9},{"bias":0,"type":"input","squash":"LOGISTIC","mask":1,"index":10},{"bias":0,"type":"input","squash":"LOGISTIC","mask":1,"index":11},{"bias":0,"type":"input","squash":"LOGISTIC","mask":1,"index":12},{"bias":-4.04319824476935,"type":"hidden","squash":"BENT_IDENTITY","mask":1,"index":13},{"bias":3.965161778022406,"type":"hidden","squash":"LOGISTIC","mask":1,"index":14},{"bias":-0.024903439043160613,"type":"hidden","squash":"LOGISTIC","mask":1,"index":15},{"bias":4.459102946814019,"type":"hidden","squash":"BENT_IDENTITY","mask":1,"index":16},{"bias":22.350059076397773,"type":"hidden","squash":"TANH","mask":1,"index":17},{"bias":6.89794047518409,"type":"hidden","squash":"SINUSOID","mask":1,"index":18},{"bias":4.712780400657457,"type":"hidden","squash":"BENT_IDENTITY","mask":1,"index":19},{"bias":2.360950734628244,"type":"hidden","squash":"BENT_IDENTITY","mask":1,"index":20},{"bias":5.984719494511575,"type":"output","squash":"RELU","mask":1,"index":21}],"connections":[{"weight":1.3046508151088858,"from":20,"to":21,"gater":null},{"weight":-1.4719492135942773,"from":19,"to":21,"gater":null},{"weight":0.7942225532534488,"from":18,"to":21,"gater":null},{"weight":-1.766236023824728,"from":17,"to":21,"gater":null},{"weight":-2.797273574355064,"from":15,"to":21,"gater":null},{"weight":-1.6320520441770618,"from":14,"to":21,"gater":null},{"weight":5.168947992813509,"from":12,"to":21,"gater":null},{"weight":1.0115672975260823,"from":16,"to":17,"gater":null},{"weight":5.807016424645144,"from":11,"to":21,"gater":null},{"weight":-1.7875297680207107,"from":10,"to":21,"gater":null},{"weight":0.8620150269174012,"from":9,"to":21,"gater":null},{"weight":2.225029050103327,"from":8,"to":21,"gater":null},{"weight":-3.39114736466382,"from":14,"to":15,"gater":null},{"weight":-2.7914120245993193,"from":6,"to":21,"gater":null},{"weight":3.4717349814593064,"from":13,"to":14,"gater":null},{"weight":-1.0009493938564398,"from":4,"to":21,"gater":null},{"weight":6.505150009374003,"from":7,"to":18,"gater":null},{"weight":-3.3626112796208565,"from":9,"to":15,"gater":null},{"weight":-1.984780802582097,"from":11,"to":13,"gater":null},{"weight":6.604592401233032,"from":2,"to":21,"gater":null},{"weight":3.885886745475863,"from":8,"to":15,"gater":null},{"weight":-0.049105163407712205,"from":1,"to":21,"gater":null},{"weight":2.833802362984874,"from":2,"to":20,"gater":null},{"weight":5.1108144625523355,"from":3,"to":19,"gater":null},{"weight":-2.5264959745367883,"from":6,"to":16,"gater":null},{"weight":10.03389614009276,"from":0,"to":20,"gater":null},{"weight":2.2327970918381497,"from":5,"to":14,"gater":null},{"weight":-0.3337939812684312,"from":5,"to":13,"gater":null},{"weight":1.6682224780951946,"from":1,"to":14,"gater":null}],"input":13,"output":1,"dropout":0}
// 3000000 bestbrain : {"nodes":[{"bias":0,"type":"input","squash":"LOGISTIC","mask":1,"index":0},{"bias":0,"type":"input","squash":"LOGISTIC","mask":1,"index":1},{"bias":0,"type":"input","squash":"LOGISTIC","mask":1,"index":2},{"bias":0,"type":"input","squash":"LOGISTIC","mask":1,"index":3},{"bias":0,"type":"input","squash":"LOGISTIC","mask":1,"index":4},{"bias":0,"type":"input","squash":"LOGISTIC","mask":1,"index":5},{"bias":0,"type":"input","squash":"LOGISTIC","mask":1,"index":6},{"bias":0,"type":"input","squash":"LOGISTIC","mask":1,"index":7},{"bias":0,"type":"input","squash":"LOGISTIC","mask":1,"index":8},{"bias":0,"type":"input","squash":"LOGISTIC","mask":1,"index":9},{"bias":0,"type":"input","squash":"LOGISTIC","mask":1,"index":10},{"bias":0,"type":"input","squash":"LOGISTIC","mask":1,"index":11},{"bias":0,"type":"input","squash":"LOGISTIC","mask":1,"index":12},{"bias":-4.04319824476935,"type":"hidden","squash":"BENT_IDENTITY","mask":1,"index":13},{"bias":4.184357715725626,"type":"hidden","squash":"LOGISTIC","mask":1,"index":14},{"bias":-0.024903439043160613,"type":"hidden","squash":"LOGISTIC","mask":1,"index":15},{"bias":4.459102946814019,"type":"hidden","squash":"BENT_IDENTITY","mask":1,"index":16},{"bias":22.350059076397773,"type":"hidden","squash":"TANH","mask":1,"index":17},{"bias":6.89794047518409,"type":"hidden","squash":"SINUSOID","mask":1,"index":18},{"bias":4.712780400657457,"type":"hidden","squash":"BENT_IDENTITY","mask":1,"index":19},{"bias":2.360950734628244,"type":"hidden","squash":"BENT_IDENTITY","mask":1,"index":20},{"bias":5.984719494511575,"type":"output","squash":"RELU","mask":1,"index":21}],"connections":[{"weight":1.3046508151088858,"from":20,"to":21,"gater":null},{"weight":-1.4719492135942773,"from":19,"to":21,"gater":null},{"weight":0.7942225532534488,"from":18,"to":21,"gater":null},{"weight":-1.766236023824728,"from":17,"to":21,"gater":null},{"weight":-2.797273574355064,"from":15,"to":21,"gater":null},{"weight":-1.6320520441770618,"from":14,"to":21,"gater":null},{"weight":5.168947992813509,"from":12,"to":21,"gater":null},{"weight":1.0115672975260823,"from":16,"to":17,"gater":null},{"weight":5.807016424645144,"from":11,"to":21,"gater":null},{"weight":-1.7875297680207107,"from":10,"to":21,"gater":null},{"weight":0.8620150269174012,"from":9,"to":21,"gater":null},{"weight":2.225029050103327,"from":8,"to":21,"gater":null},{"weight":-3.39114736466382,"from":14,"to":15,"gater":null},{"weight":-2.7914120245993193,"from":6,"to":21,"gater":null},{"weight":3.4717349814593064,"from":13,"to":14,"gater":null},{"weight":-1.0009493938564398,"from":4,"to":21,"gater":null},{"weight":6.505150009374003,"from":7,"to":18,"gater":null},{"weight":-3.3626112796208565,"from":9,"to":15,"gater":null},{"weight":-1.984780802582097,"from":11,"to":13,"gater":null},{"weight":6.604592401233032,"from":2,"to":21,"gater":null},{"weight":3.885886745475863,"from":8,"to":15,"gater":null},{"weight":-0.049105163407712205,"from":1,"to":21,"gater":null},{"weight":2.833802362984874,"from":2,"to":20,"gater":null},{"weight":5.1108144625523355,"from":3,"to":19,"gater":null},{"weight":-2.5264959745367883,"from":6,"to":16,"gater":null},{"weight":10.03389614009276,"from":0,"to":20,"gater":null},{"weight":2.2327970918381497,"from":5,"to":14,"gater":null},{"weight":-0.3337939812684312,"from":5,"to":13,"gater":null},{"weight":1.6682224780951946,"from":1,"to":14,"gater":null}],"input":13,"output":1,"dropout":0}
// 8800000 bestbrain : {"nodes":[{"bias":0,"type":"input","squash":"LOGISTIC","mask":1,"index":0},{"bias":0,"type":"input","squash":"LOGISTIC","mask":1,"index":1},{"bias":0,"type":"input","squash":"LOGISTIC","mask":1,"index":2},{"bias":0,"type":"input","squash":"LOGISTIC","mask":1,"index":3},{"bias":0,"type":"input","squash":"LOGISTIC","mask":1,"index":4},{"bias":0,"type":"input","squash":"LOGISTIC","mask":1,"index":5},{"bias":0,"type":"input","squash":"LOGISTIC","mask":1,"index":6},{"bias":0,"type":"input","squash":"LOGISTIC","mask":1,"index":7},{"bias":0,"type":"input","squash":"LOGISTIC","mask":1,"index":8},{"bias":0,"type":"input","squash":"LOGISTIC","mask":1,"index":9},{"bias":0,"type":"input","squash":"LOGISTIC","mask":1,"index":10},{"bias":0,"type":"input","squash":"LOGISTIC","mask":1,"index":11},{"bias":0,"type":"input","squash":"LOGISTIC","mask":1,"index":12},{"bias":-4.1033241675013645,"type":"hidden","squash":"BENT_IDENTITY","mask":1,"index":13},{"bias":4.512056782058423,"type":"hidden","squash":"LOGISTIC","mask":1,"index":14},{"bias":-0.034131674139397994,"type":"hidden","squash":"LOGISTIC","mask":1,"index":15},{"bias":0.22929120545320902,"type":"hidden","squash":"LOGISTIC","mask":1,"index":16},{"bias":21.773676596344608,"type":"hidden","squash":"LOGISTIC","mask":1,"index":17},{"bias":6.869477305038724,"type":"hidden","squash":"SINUSOID","mask":1,"index":18},{"bias":4.712780400657457,"type":"hidden","squash":"BENT_IDENTITY","mask":1,"index":19},{"bias":2.360950734628244,"type":"hidden","squash":"BENT_IDENTITY","mask":1,"index":20},{"bias":5.984719494511575,"type":"output","squash":"IDENTITY","mask":1,"index":21}],"connections":[{"weight":1.3046508151088858,"from":20,"to":21,"gater":null},{"weight":-1.4719492135942773,"from":19,"to":21,"gater":null},{"weight":0.7942225532534488,"from":18,"to":21,"gater":null},{"weight":-1.766236023824728,"from":17,"to":21,"gater":null},{"weight":-2.797273574355064,"from":15,"to":21,"gater":null},{"weight":-1.6320520441770618,"from":14,"to":21,"gater":null},{"weight":5.168947992813509,"from":12,"to":21,"gater":null},{"weight":-1.025549508927142,"from":16,"to":17,"gater":null},{"weight":7.344484849786535,"from":11,"to":21,"gater":null},{"weight":-1.7875297680207107,"from":10,"to":21,"gater":null},{"weight":0.8530414887622282,"from":9,"to":21,"gater":null},{"weight":2.2050264206378807,"from":8,"to":21,"gater":null},{"weight":-3.39114736466382,"from":14,"to":15,"gater":null},{"weight":-2.7914120245993193,"from":6,"to":21,"gater":null},{"weight":3.4717349814593064,"from":13,"to":14,"gater":null},{"weight":-1.0009493938564398,"from":4,"to":21,"gater":null},{"weight":6.478278097096146,"from":7,"to":18,"gater":null},{"weight":-3.3626112796208565,"from":9,"to":15,"gater":null},{"weight":-0.015408002675858068,"from":11,"to":13,"gater":null},{"weight":6.604592401233032,"from":2,"to":21,"gater":null},{"weight":3.9160714833097034,"from":8,"to":15,"gater":null},{"weight":-0.049105163407712205,"from":1,"to":21,"gater":null},{"weight":2.833802362984874,"from":2,"to":20,"gater":null},{"weight":5.1108144625523355,"from":3,"to":19,"gater":null},{"weight":-2.1599196424446734,"from":6,"to":16,"gater":null},{"weight":9.598202929773297,"from":0,"to":20,"gater":null},{"weight":2.6549682099483993,"from":5,"to":14,"gater":null},{"weight":-0.36988132432806853,"from":5,"to":13,"gater":null},{"weight":1.6682224780951946,"from":1,"to":14,"gater":null}],"input":13,"output":1,"dropout":0}

var best = null
var bestScore = 0
var birds = []
var dead = []
var pipes = []
var counter = 0
var slider
var sliderm
var pipe_appairs
var log
var showb = true
var showclones = false
var hard = false
var shard = false
var hhard = false
var log
var bfrs
var bestnumgen

function sqr(a) {
  return a*a;
}

function distance(x1, y1, x2, y2) {
  return Math.sqrt(sqr(y2 - y1) + sqr(x2 - x1));
}

function setup () {
  const bshard = localStorage.getItem('bestbhard')
  const bsshard = localStorage.getItem('bestbshard')
  const bshhard = localStorage.getItem('bestbhhard')
  const bshowb = localStorage.getItem('bestshowb')
  const bshowc = localStorage.getItem('bestshowc')
  bestnumgen = localStorage.getItem('bestnumgen')
  bfrs = localStorage.getItem('bestfrs')
  if (!bfrs) bfrs = 0
  if (bshard === 'true') hard = true
  if (bsshard === 'true') shard = true
  if (bshhard === 'true') hhard = true
  if (bestnumgen) numGeneration = bestnumgen
  bshowb === 'true' ? showb = true : showb = false
  bshowc === 'true' ? showclones = true : showclones = false

  frameRate(30)
  createCanvas(600, 600)
  log = createDiv('')
  const box = createCheckbox('hard', hard)
  box.position(650, 169);
  const sbox = createCheckbox('Super Hard', shard)
  sbox.position(650, 209);
  const hbox = createCheckbox('Ultra Hard', hhard)
  hbox.position(650, 249);
  box.changed(() => {
    hard = box.checked()
    localStorage.setItem('bestbhard', hard)
    pipes = []
    counter = 0
    bestScore = 0
    bfrs = 0
  })
  sbox.changed(() => {
    shard = sbox.checked()
    localStorage.setItem('bestbshard', shard)
    if (shard) {
      hard = true
      localStorage.setItem('bestbhard', hard)
    }
    pipes = []
    counter = 0
    bestScore = 0
    bfrs = 0
  })
  hbox.changed(() => {
    hhard = sbox.checked()
    localStorage.setItem('bestbhhard', hhard)
    if (hhard) {
      hard = true
      shard = true
      localStorage.setItem('bestbhard', hard)
      localStorage.setItem('bestbshard', shard)
    }
    pipes = []
    counter = 0
    bestScore = 0
    bfrs = 0
  })

  slider = createSlider(1, 100, 1)
  sliderm = createSlider(1, 20, 1)
  const saved = localStorage.getItem('bestbrain')
  const bsaved = localStorage.getItem('bestscore')
  let brain
  try {
    brain = saved ? neataptic.Network.fromJSON(JSON.parse(saved)) : null
    if (brain) {
      best = new Bird(brain, null, true)
      drawGraph(best.brain.graph(300, 200), '.svg')
    }
  } catch(e) {
    console.error('FAILED TO Load best', e)
  }
  for(let i = 0; i < POPULATION; i++) birds.push(new Bird(brain))
  log = createDiv('LOG')
  var buttons = createButton('START')
  buttons.position(650, 9);
  buttons.mousePressed(() => {
    loop();
  })
  button = createButton('STOP')
  button.position(650, 49);
  button.mousePressed(() => {
    noLoop();
  })
  button = createCheckbox('SHOW BEST', showb)
  button.position(650, 89);
  button.changed(() => {
    best.killed = false
    showb = !showb
    localStorage.setItem('bestshowb', showb)
  })
  button = createCheckbox('SHOW CLONES', showclones)
  button.position(650, 129);
  button.changed(() => {
    showclones = !showclones
    localStorage.setItem('bestshowc', showclones)
  })
}

function toDate (frs) {
  const seconds = Math.ceil(frs / 30)
  if (seconds < 60) return seconds + 's.'
  const minutes = Math.ceil(seconds / 60)
  if (minutes < 60) return minutes + 'mn.'
  const hours = Math.ceil(minutes / 60)
  if (hours < 24) return hours + 'h.'
  const days = Math.ceil(hours / 24)
  return days + 'j.'
}

function draw () {
  pipe_appairs = PIPE_APPAIRS
  const maxc = slider.value() * sliderm.value()
  if (!hard) pipe_appairs += 100
  if (shard) pipe_appairs -= 50
  log.elt.innerHTML = '<small>FPS multiplieur: ' + maxc + '</small> Frames: ' + counter + ' h(' + hard + ') : ' + ' sh(' + shard + ') birds: ' + birds.length + ' gen: ' + numGeneration + ' fr: ' + frameRate() + '<br>' + 
    '<h1>BEST: ' + toDate(bfrs) + ' Génération: ' + bestnumgen + '<h1>'
  for (let i = 0; i < maxc; i++) {
    if (counter++ % pipe_appairs === 0) {
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

    let bmax, max = 0
    birds.forEach((bird) => {
      bird.first = false
      if (bird.score > max) {
        bmax = bird
        max = bird.score
      }
      bird.think(pipes)
      bird.update()
    })
    if (bmax) bmax.first = true

    // if (birds.length < POPULATION*0.1 && bestScore > 2000000) {
    //   birds.forEach(bird => {
    //     bird.killed = true
    //   })
    //   best.killed = true
    // }

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
  if (best && !best.killed && showb) {
    best.show(true)
  }
  birds.forEach(b => (b.first || showclones) ? b.show() : null)
}

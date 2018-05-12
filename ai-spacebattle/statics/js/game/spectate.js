var context, scale, first
const sketch = (socket, name) => {
  let containerDiv = document.getElementById('container')
  containerDiv.style.width = CONSTANTS.CANVAS_WIDTH + 'px'
  containerDiv.style.height = CONSTANTS.CANVAS_HEIGHT + 'px'
  let gameDiv = document.getElementById('game')
  gameDiv.style.width = CONSTANTS.CANVAS_WIDTH + 'px'
  gameDiv.style.height = CONSTANTS.CANVAS_HEIGHT + 'px'
  let backgroundDiv = document.getElementById('background')
  backgroundDiv.style.width = CONSTANTS.WIDTH + 'px'
  backgroundDiv.style.height = CONSTANTS.HEIGHT + 'px'
  let firstDiv = document.getElementById('first')
  let move = true, mouse, best, hold = false, xCenter, yCenter, nb = 0, distances = []
  return (p) => {
    p.setup = function () {
      p.simul = true
      p.noStroke()
      const canvas = p.createCanvas(CONSTANTS.CANVAS_WIDTH, CONSTANTS.CANVAS_HEIGHT)
      p.frameRate(30)

      xCenter = CONSTANTS.CANVAS_WIDTH / 2
      yCenter = CONSTANTS.CANVAS_HEIGHT / 2

      socket.on('f', function (data) {
        context = new Context(data, p)
        context.setBounds(xCenter, yCenter)
      })
      socket.on('nb', function (nb_) {
        nb = nb_
      })
      socket.on('best', function (nb_) {
        best = nb_
      })
      socket.on('brain', function (json) {
        console.log('BRAIN', json)
        const brain = neataptic.Network.fromJSON(json)
        let svg = document.getElementById('brain')
        WIDTH = CONSTANTS.WIDTH
        HEIGHT = CONSTANTS.HEIGHT
        svg.setAttribute('width', CONSTANTS.WIDTH + 'px')
        svg.setAttribute('height', CONSTANTS.HEIGHT + 'px')
        // svg.setAttribute('viewBox', (CONSTANTS.HEIGHT - CONSTANTS.WIDTH) + ' 0 ' + CONSTANTS.WIDTH + ' ' + CONSTANTS.HEIGHT)
        svg.setAttribute('viewBox', '-400 -' + CONSTANTS.HEIGHT * 0.5 + ' ' + CONSTANTS.WIDTH * 1.2 + ' ' + CONSTANTS.HEIGHT * 1.2)
        svg.style.display = 'block'
        drawGraph(brain.graph(CONSTANTS.WIDTH, CONSTANTS.HEIGHT), '#brain')
      })

      socket.on('first', function (id) {
        if (typeof context.ships[id] !== 'undefined') {
          first = context.ships[id]
          firstDiv.innerHTML = '<h4>First: ' + first.name + ' => Score: ' + Math.round(first.context.s) + '  Distance: ' + Math.round(first.context.d * 100) + ' <small>(' + nb + ')</small></h4>'
          if (best) {
            firstDiv.innerHTML += '<h1>Best score: ' + best + '</h1>' 
          }
          distances.push(first.context.d)
        }
      })
    }
      
    p.draw = function () {
      p.clear()

      p.scale(scale)
      p.background(0, 0)
      p.fill(255, 255, 255, 255)
      if (context) {
        if (p.keyIsDown(p.UP_ARROW)) {
          yCenter += 10
        } else if (p.keyIsDown(p.DOWN_ARROW)) {
          yCenter -= 10
        } else if (p.keyIsDown(p.LEFT_ARROW)) {
          xCenter += 10
        } else if (p.keyIsDown(p.RIGHT_ARROW)) {
          xCenter -= 10
        }
        if (xCenter > 15) xCenter = 15
        if (xCenter < -(CONSTANTS.WIDTH - CONSTANTS.CANVAS_WIDTH + 15)) xCenter = -(CONSTANTS.WIDTH - CONSTANTS.CANVAS_WIDTH + 15)
        if (yCenter > 15) yCenter = 15
        if (yCenter < -(CONSTANTS.HEIGHT - CONSTANTS.CANVAS_HEIGHT + 15)) yCenter = -(CONSTANTS.HEIGHT - CONSTANTS.CANVAS_HEIGHT + 15)
        context.setBounds(xCenter, yCenter)
        p.translate(xCenter, yCenter)
        context.draw()
      }
    }

    p.keyPressed = function () {
      console.log(p.keyCode)
      if (p.keyCode === 72) { // h
        socket.emit('h', true)
      } else if (p.keyCode === 85) {// u
        socket.emit('h', false)
      } else if (p.keyCode === 66) {// b
        socket.emit('b')
      }
    }
  }
}

function init () {
  document.body.style.margin = 0
  var w = window,
    d = document,
    e = d.documentElement,
    g = d.getElementsByTagName('body')[0],
    x = w.innerWidth || e.clientWidth || g.clientWidth,
    y = w.innerHeight|| e.clientHeight|| g.clientHeight;

  const scaleX = x / CONSTANTS.WIDTH
  const scaleY = y / CONSTANTS.HEIGHT
  
  scale = scaleX > scaleY ? scaleY : scaleX
  if (scale > 1) scale = 0.8
  console.log('SCALE', scale)
  
  CONSTANTS.CANVAS_WIDTH = CONSTANTS.WIDTH
  CONSTANTS.CANVAS_HEIGHT = CONSTANTS.HEIGHT
  const socket = io()
  socket.on('connect', function () {
    socket.emit('spectate')
    new p5(sketch(socket), 'game')
  })
}

function sqr(a) {
  return a*a;
}

function distance(x1, y1, x2, y2) {
  return Math.sqrt(sqr(y2 - y1) + sqr(x2 - x1));
}

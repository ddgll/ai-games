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
  let move = true, mouse, hold = false, xCenter, yCenter
  return (p) => {
    p.setup = function () {
      p.noStroke()
      const canvas = p.createCanvas(CONSTANTS.CANVAS_WIDTH, CONSTANTS.CANVAS_HEIGHT)
      p.frameRate(CONSTANTS.FRAME_RATE)
      p.noLoop()

      xCenter = CONSTANTS.CANVAS_WIDTH / 2
      yCenter = CONSTANTS.CANVAS_HEIGHT / 2

      socket.on('f', function (data) {
        context = new Context(data, p)
        context.setBounds(xCenter, yCenter)
      })
      socket.on('c', function (ctx) {
        if (!context) return
        if (context.fromRemote(ctx)) p.loop()
      })

      socket.on('first', function (id) {
        if (typeof context.ships[id] !== 'undefined') {
          first = context.ships[id]
          firstDiv.innerHTML = '<h1>First: ' + first.name + ' => ' + Math.round(first.context.s) + ' <small>(' + first.context.l + ')</small></h1>'
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
        context.update()
        p.translate(xCenter, yCenter)
        context.draw()
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
  
  CONSTANTS.CANVAS_WIDTH = CONSTANTS.WIDTH
  CONSTANTS.CANVAS_HEIGHT = CONSTANTS.HEIGHT
  console.log(CONSTANTS)
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

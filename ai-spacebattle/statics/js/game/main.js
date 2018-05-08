const sketch = () => {
  let frameDiv = null //document.getElementById('frame')
  let log = null //document.getElementById('log')
  let containerDiv = document.getElementById('container')
  containerDiv.style.width = CONSTANTS.CANVAS_WIDTH + 'px'
  containerDiv.style.height = CONSTANTS.CANVAS_HEIGHT + 'px'
  let gameDiv = document.getElementById('game')
  gameDiv.style.width = CONSTANTS.CANVAS_WIDTH + 'px'
  gameDiv.style.height = CONSTANTS.CANVAS_HEIGHT + 'px'
  let backgroundDiv = document.getElementById('background')
  backgroundDiv.style.width = CONSTANTS.WIDTH + 'px'
  backgroundDiv.style.height = CONSTANTS.HEIGHT + 'px'
  let move = true, context, socket, mouse, hold = false
  return (p) => {
    p.setup = function () {
      p.noStroke()
      p.createCanvas(CONSTANTS.CANVAS_WIDTH, CONSTANTS.CANVAS_HEIGHT)
      p.frameRate(CONSTANTS.FRAME_RATE)
      p.noLoop()
      socket = io()
      socket.on('connection', function () {
        console.log('Connected')
      })
      socket.on('f', function (data) {
        context = new Context(data, p, log)
      })
      socket.on('c', function (ctx) {
        if (context.fromRemote(ctx)) p.loop()
      })
    }
      
    p.draw = function () {
      p.clear()
      p.background(0, 0)
      p.fill(255, 255, 255, 255)
      if (context) {
        // console.log('DRAW', context.d, buffer.length, p.frameRate())
        context.update()
        context.draw(frameDiv, backgroundDiv)
      }
    }

    p.keyPressed = function () {
      if (p.keyCode === 85) {
        socket.emit('u')
      } else if (p.keyCode === 83) {
        console.log('SEND RETRY')
        socket.emit('s')
      } else if (p.keyCode === 77) {
        move = !move
        console.log('MOVE', move, p.keyCode)
      } else if (p.keyCode === 90) {
        socket.emit('c', [p.mouseX,p.mouseY])
      }
    }

    p.touchMoved = function () {
      console.log(p.touches)
      if (p.touches.length > 1) {
        socket.emit('c', [p.touches[0].x,p.touches[0].y])  
      }
      if (p.touches.length > 0) {
        move(p.touches[0].x, p.touches[0].y)
      }
    }

    p.mouseClicked = function () {
      // console.log('MOUSE CLICKED')
      socket.emit('c', [p.mouseX,p.mouseY])
    }

    p.mouseMoved = function () {
      move(p.mouseX, p.mouseY)
    }

    function move (x_, y_) {
      if (!context || !context.me || x_ > p.width || x_ < 0 || y_ > p.height || y_ < 0 || !move || p.keyIsDown(65)) return
      const me = context.me
      const x = Math.round(x_)
      const y = Math.round(y_)
      let m
      if (!mouse) {
        m = { x, y }
        mouse = m
      } else {
        const dMouse = distance(x, y, mouse.x, mouse.y)
        const dMe = distance(x, y, me.x, me.y)
        if (dMouse > CONSTANTS.MIN_MOVE_PAS) {
          m = { x, y }
          mouse = m
        }
      }
      if (m) {
        // console.log('MOUSE MOVE', m)
        socket.emit('m', [m.x,m.y])
      }
    }
  }
}
function init () {
  new p5(sketch(), 'game')
}

function sqr(a) {
  return a*a;
}

function distance(x1, y1, x2, y2) {
  return Math.sqrt(sqr(y2 - y1) + sqr(x2 - x1));
}

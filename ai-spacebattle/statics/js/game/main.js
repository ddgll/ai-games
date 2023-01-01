var context, obs = false
const sketch = (socket, name) => {
  let frameDiv = null // document.getElementById('frame')
  let log = null // document.getElementById('log')
  let containerDiv = document.getElementById('container')
  containerDiv.style.width = CONSTANTS.CANVAS_WIDTH + 'px'
  containerDiv.style.height = CONSTANTS.CANVAS_HEIGHT + 'px'
  let gameDiv = document.getElementById('game')
  gameDiv.style.width = CONSTANTS.CANVAS_WIDTH + 'px'
  gameDiv.style.height = CONSTANTS.CANVAS_HEIGHT + 'px'
  let backgroundDiv = document.getElementById('background')
  backgroundDiv.style.width = CONSTANTS.WIDTH + 'px'
  backgroundDiv.style.height = CONSTANTS.HEIGHT + 'px'
  let move = true, mouse, hold = false, buffer = []

  return (p) => {
    p.setup = function () {
      p.noStroke()
      p.createCanvas(CONSTANTS.CANVAS_WIDTH, CONSTANTS.CANVAS_HEIGHT)
      p.frameRate(CONSTANTS.FRAME_RATE)
      // p.noLoop()

      socket.on('f', function (data) {
        context = new Context(data, p, log)
      })
      socket.on('c', function (ctx) {
        if (!context) return
        context.fromRemote(ctx)
      })
    }
      
    p.draw = function () {
      p.clear()
      p.background(0, 0)
      p.fill(255, 255, 255, 255)
      if (context) {
        context.update()
        context.draw(frameDiv, backgroundDiv)
      }
    }

    p.keyPressed = function () {
      console.log('KEY PREE', p.keyCode)
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
      } else if (p.keyCode === 80) {
        if (hold) {
          p.loop()
        } else {
          p.noLoop()
        }
        hold = !hold
      }
    }

    // p.touchMoved = function () {
    //   // console.log(p.touches)
    //   if (p.touches.length > 1) {
    //     socket.emit('c', [p.touches[0].x,p.touches[0].y])  
    //   }
    //   if (p.touches.length > 0) {
    //     moveShip(p.touches[0].x, p.touches[0].y)
    //   }
    // }

    p.mouseClicked = function () {
      if (!context) return
      socket.emit('c', [p.mouseX,p.mouseY])
    }

    p.mouseMoved = function () {
      moveShip(p.mouseX, p.mouseY)
    }

    function moveShip (x_, y_) {
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

const observe = () => {
  const VWIDTH = 10
  const WIDTH = Math.round(2 * CONSTANTS.VISION.SIDE * VWIDTH)
  const HEIGHT = Math.round((CONSTANTS.VISION.TOP + CONSTANTS.VISION.BOTTOM) * VWIDTH)
  return (p) => {
    p.setup = function () {
      const div = document.getElementById('log')    
      console.log(WIDTH, HEIGHT)
      div.style.width = WIDTH * 4 + 'px'
      div.style.height = HEIGHT * 4 + 'px'
      p.noStroke()
      p.createCanvas(WIDTH * 4, HEIGHT * 4)
      p.frameRate(CONSTANTS.FRAME_RATE)
    }
      
    p.draw = function () {
      p.clear()
      p.background(0)
      if (context && context.planets && context.ships && typeof context.ships[context.me.id] !== 'undefined') {
        const hero = context.ships[context.me.id]
        const o = context.sense(hero.id, +hero.context.x, +hero.context.y, +hero.context.a)
        const vision = o.v
        const observations = o.o

        const walls = observations[observations.length - 1]

        p.push()
        p.translate(WIDTH * 2, HEIGHT * 2)
        p.fill(255, 255, 0)
        // p.rotate(hero.context.a)
        p.triangle(VWIDTH / 2, VWIDTH / 2, -VWIDTH/2, VWIDTH/2, 0, -VWIDTH/2)
        let x, y, red, green
        p.pop()
        p.push()
        p.translate(WIDTH * 2 - WIDTH / 2, HEIGHT * 2 - (CONSTANTS.VISION.TOP * VWIDTH))
        // p.rotate(-hero.context.a)
        for (let i = 0, l = 2 * CONSTANTS.VISION.SIDE; i < l; i++) {
          x = i * VWIDTH
          for (let j = 0, ll = CONSTANTS.VISION.TOP + CONSTANTS.VISION.BOTTOM; j < ll; j++){
            y = j * VWIDTH
            red = (vision[i][j] * 255)
            green = 255 - red
            // console.log('FILF', green, red, vision[index])
            p.stroke(255)
            p.fill(red, green, 0, 125)
            p.rect(x, y, VWIDTH, VWIDTH)
          }
        }
        p.rect(walls.x, walls.y, walls.w, walls.h)
        p.pop()
      }
    }
  }
}

const minimap = () => {
  const getMinimapCoords = (x, y) => {
    return { x: x / CONSTANTS.MINIMAP_SCALE, y: y / CONSTANTS.MINIMAP_SCALE }
  }

  const getMinimapProportion = (x) => {
    return (x / CONSTANTS.MINIMAP_SCALE)
  }

  const updateMinimap = () => {
    let coords = getMinimapCoords(this.hero.x, this.hero.y)
  }

  return (p) => {
    p.setup = function () {
      const div = document.getElementById('minimap')
      const WIDTH = Math.round(CONSTANTS.WIDTH / CONSTANTS.MINIMAP_SCALE)
      const HEIGHT = Math.round(CONSTANTS.HEIGHT / CONSTANTS.MINIMAP_SCALE)
      div.style.width = WIDTH + 'px'
      div.style.height = HEIGHT + 'px'
      p.noStroke()
      p.createCanvas(WIDTH, HEIGHT)
      p.frameRate(CONSTANTS.FRAME_RATE)
    }
      
    p.draw = function () {
      p.clear()
      p.background(125, 125)
      p.fill(255, 255, 255, 255)
      if (context && context.planets && context.ships && typeof context.ships[context.me.id] !== 'undefined') {
        const planets = context.planets
        const hero = context.ships[context.me.id]
        const o = context.sense(hero.id, hero.x, hero.y, hero.context.a)
        const vision = o.v
        const observations = o.o

        p.push()
        p.translate(CONSTANTS.VISION.SIDE * 4 * CONSTANTS.VISION.WIDTH, CONSTANTS.VISION.TOP * 2 * CONSTANTS.VISION.WIDTH)
        p.fill(255, 255, 0)
        p.rotate(hero.context.a)
        p.triangle(CONSTANTS.SHIP_SIZE/2, CONSTANTS.SHIP_SIZE/2, -CONSTANTS.SHIP_SIZE/2, CONSTANTS.SHIP_SIZE/2, 0, -CONSTANTS.SHIP_SIZE/2)
        let x, y, red, green, index
        for (let i = 0, l = 2 * CONSTANTS.VISION.SIDE; i < l; i++) {
          x = -(CONSTANTS.VISION.SIDE * CONSTANTS.VISION.WIDTH) + i * CONSTANTS.VISION.WIDTH
          for (let j = 0, ll = CONSTANTS.VISION.TOP + CONSTANTS.VISION.BOTTOM; j < ll; j++){
            y = -(CONSTANTS.VISION.TOP * CONSTANTS.VISION.WIDTH) + j * CONSTANTS.VISION.WIDTH
            red = (vision[i][j] * 255)
            green = 255 - red
            // console.log('FILF', green, red, vision[index])
            p.stroke(255)
            p.fill(red, green, 0, 125)
            p.rect(x, y, CONSTANTS.VISION.WIDTH, CONSTANTS.VISION.WIDTH)
          }
        }
        // console.log(observations)
        p.noStroke()
        p.fill(255)
        observations.forEach((o) => {
          switch(o.type) {
            case 'bo':
            case 'p':
            case 'b':
            case 'a':
              p.ellipse(o.x, o.y, o.r, o.r || 15)
              break;
            case 's':
              p.ellipse(o.x, o.y, o.r, o.r)
              break;
            case 'w':
              p.strokeWeight(4)
              p.stroke(0, 255, 0)
              p.noFill()
              p.rect(o.x, o.y, o.w, o.h)
              break;
          }
        })
        p.pop()

        let item, radius, coords, owner, challenge, challenger
        for(let id in planets) {
          item = planets[id]
          challenge = item.challenge
          challenger = item.challenger
          radius = getMinimapProportion(item.r)
          coords = getMinimapCoords(item.x, item.y)
          owner = parseInt(item.context.o)
          p.push()
          if (owner === hero.id) {
            p.fill(100, 200, 100, 255)
          } else if (!isNaN(owner)) {
            p.fill(200, 100, 100, 255)
          } else {
            p.fill(125, 125, 125, 255)
          }
          p.ellipse(coords.x, coords.y, radius, radius)
          p.pop()
          if (challenge) {
            const angle = challenge * 2 * Math.PI / 100
            p.push()
            p.translate(coords.x, coords.y)
            if (challenger === hero.id) {
              p.fill(0, 255, 0, 125)
            } else {
              if (owner === hero.id) {
                p.noFill()
                p.strokeWeight(1)
                p.stroke(255, 255, 0)
                p.ellipse(0, 0, radius, radius)
                p.noStroke()
              }
              p.fill(255, 255, 0, 125)
            }
            p.arc(0, 0, radius, radius, Math.PI, Math.PI + angle)
            p.pop()
          }
        }
        if (context.bounds) {
          const cMin = getMinimapCoords(context.bounds.xMin + CONSTANTS.PLANET_MAX_RADIUS, context.bounds.yMin + CONSTANTS.PLANET_MAX_RADIUS)
          const cMax = getMinimapCoords(context.bounds.xMax - CONSTANTS.PLANET_MAX_RADIUS, context.bounds.yMax - CONSTANTS.PLANET_MAX_RADIUS)
          p.push()
          p.noFill()
          p.stroke(255, 50)
          p.rect(cMin.x, cMin.y, cMax.x - cMin.x, cMax.y - cMin.y)
          p.pop()
        }
        coords = getMinimapCoords(hero.x, hero.y)
        const size = getMinimapProportion(CONSTANTS.SHIP_SIZE)
        const a = parseInt(hero.context.a)
        p.push()
        p.translate(coords.x, coords.y)
        p.rotate(a)
        p.triangle(-size/2, 0, size/2, 0, 0, size)
        p.pop()
      }
    }
  }
}
function init () {
  const socket = io()
  let context
  const form = document.getElementById('form')
  const container = document.getElementById('container')
  const btn = document.getElementById('go')
  const nameInput = document.getElementById('name')

  const go = (name) => {
    form.style.display = 'none'
    container.style.display = 'block'
    launchGame(socket, name)
    console.log('Socket EMIT', name, socket)
    socket.emit('s', name)
  }

  btn.addEventListener('click', () => {
    const name = nameInput.value
    if (!name || !name.length) {
      alert('Please enter a name')
    } else {
      go(name)
    }
  })

  nameInput.addEventListener('keyup', (ev) => {
    const name = nameInput.value.replace(/\|/g, '')
    nameInput.value = name
    if (name.length > 10) nameInput.value = name.slice(0, 10)
    if (ev.keyCode === 13) go(name)
  })

  socket.on('connect', function () {
    // go('ddgll')
  })
}

function launchGame(socket, name) {
  new p5(sketch(socket, name), 'game')
  new p5(minimap(), 'minimap')
  new p5(observe(), 'log')
}

function sqr(a) {
  return a*a;
}

function distance(x1, y1, x2, y2) {
  return Math.sqrt(sqr(y2 - y1) + sqr(x2 - x1));
}

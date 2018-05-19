var context, scale, debug, debugObs = [], chartData = [['Time', 'Reward', 'Loss']], chart, obs = true, human = true, loop = true, logsDiv, observators = {}
const sketch = (socket, scale) => {
  let logsDiv = document.getElementById('logs')
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
  let move = true, mouse, best, hold = false, xCenter, yCenter, nb = 0
  // const drawChart = (context) => {
  //   if (!context || !context.s || !context.s.length || !google || !google.visualization || !google.visualization.arrayToDataTable || !google.visualization.LineChart) return
  //   let sumR = 0, sumL = 0
  //   context.s.forEach(s => {
  //     sumR += s.re
  //     sumL += isNaN(s.lo) ? 0 : s.lo
  //   })
  //   const moyR = sumR / context.s.length
  //   const moyL = sumL / context.s.length
  //   if (chartData.length > 1000) chartData = []
  //   chartData.push([context.t, moyR, moyL])
  //   var data = google.visualization.arrayToDataTable(chartData);
  //   var options = {
  //     title: 'Training',
  //     curveType: 'function',
  //     legend: { position: 'bottom' }
  //   };

  //   if (!chart) chart = new google.visualization.LineChart(document.getElementById('chart'));

  //   chart.draw(data, options)
  // }

  // google.charts.load('current', {'packages':['corechart']});
  // google.charts.setOnLoadCallback(drawChart)

  return (p) => {
    p.setup = function () {
      let btn = document.getElementById('loop')
      btn.addEventListener('click', () => {
        loop = !loop
        if (loop) {
          p.loop()
          debugObs.forEach(po => po.loop())
          btn.innerHTML = 'Stop'
        } else {
          p.noLoop()
          debugObs.forEach(po => po.noLoop())
          btn.innerHTML = 'Start'
        }
      })
      debug = p
      p.simul = true
      p.noStroke()
      const canvas = p.createCanvas(CONSTANTS.CANVAS_WIDTH, CONSTANTS.CANVAS_HEIGHT)
      p.frameRate(30)

      xCenter = CONSTANTS.CANVAS_WIDTH / 2
      yCenter = CONSTANTS.CANVAS_HEIGHT / 2

      let counter = 0

      socket.on('f', function (data) {
        console.log('SET Context')
        context = new Context(data, p)
        context.setBounds(xCenter, yCenter)
      })
      socket.on('c', function (ctx) {
        if (!context) return
        context.fromRemote(ctx)
      })
      socket.on('o', function ({ id, ship, o, a }) {
        if (!context) return
        if (!observators[id]) {
          logsDiv.innerHTML += `<div id="obs-${id}"></div>`
          setTimeout(() => {
            new p5(observe(id), `obs-${id}`)
          }, 1000)
        }
        observators[id] = { o, a }
      })

      const setFirst = (ctx) => {
        let max = -Infinity, first
        ctx.s.forEach(s => {
          if (s.s > max) {
            max = s.s
            first = s
          }
        })
        if (first) {
          firstDiv.innerHTML = '<h4>First: ' + first.n + ' => Score: ' + Math.round(first.s) + '  Distance: ' + Math.round(first.d * 100) + ' <small>(' + nb + ')</small></h4>'
        }
      }
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
        context.update()
        context.setBounds(xCenter, yCenter)
        p.translate(xCenter, yCenter)
        context.draw()
      }
    }
  }
}

const observe = (id) => {
  return (p) => {
    debugObs.push(p)
    p.setup = () => {
      p.noStroke()
      const canvas = p.createCanvas(CONSTANTS.PLANET_MAX_RADIUS * 2, CONSTANTS.PLANET_MAX_RADIUS * 2)
      p.frameRate(30)
    }

    const lerp = (norm, min, max) => {
      return (max - min) * norm + min
    }

    p.draw = () => {
      p.scale(0.5)
      p.background(0)
      if (typeof observators[id] === 'undefined') return
      const observations = observators[id].o
      const angle = observators[id].a 
      if(!observations || !observations.length) return
      p.push()
      p.translate(CONSTANTS.PLANET_MAX_RADIUS * 2, CONSTANTS.PLANET_MAX_RADIUS * 2)
      p.push()
      p.rotate(Math.PI)
      p.triangle(-CONSTANTS.SHIP_SIZE / 2, -CONSTANTS.SHIP_SIZE / 2, CONSTANTS.SHIP_SIZE / 2, -CONSTANTS.SHIP_SIZE / 2, 0, CONSTANTS.SHIP_SIZE/2)
      p.pop()
      for (let i = 0, l = observations.length - 1, ox, oy, mult; i < l; i += 2) {
        mult = i < 4 ? 4 : 1
        ox = observations[i]
        oy = observations[i + 1]
        p.stroke(0, 255, 255)
        if (i < 3) { // planets
          p.stroke(0, 255, 0)         
        } else if (i < 7) { // ships
          p.stroke(255, 255, 0)
        } else if (i < 11) { // asteroids
          p.stroke(255, 0, 255)
        } else if (i < 15) { //bonuses
          p.stroke(0, 255, 0)
        } else if (i < 24) { // bullets
          p.stroke(0, 255, 255)
        } else { // wall
          p.stroke(255, 255, 0)
        }
        if (i < 24) {
          if (ox === 1 && oy === 1) continue
          ox = lerp(ox, -CONSTANTS.PLANET_MAX_RADIUS * mult, CONSTANTS.PLANET_MAX_RADIUS * mult) // - p.WIDTH / 2
          oy = lerp(oy, -CONSTANTS.PLANET_MAX_RADIUS * mult, CONSTANTS.PLANET_MAX_RADIUS * mult) // - p.HEIGHT / 2
          p.line(0, 0, ox, oy)
          p.ellipse(ox, oy, 10, 10)
        } else if (i <  26) {
          if (ox !== 1) {
            ox = lerp(ox, 0, CONSTANTS.PLANET_MAX_RADIUS * mult) // - p.WIDTH / 2
            p.line(0, 0, -ox, 0)
            p.ellipse(-ox, 0, 10, 10)
          }
          if (oy !== 1) {
            oy = lerp(oy, 0, CONSTANTS.PLANET_MAX_RADIUS * mult) // - p.WIDTH / 2
            p.line(0, 0, oy, 0)
            p.ellipse(oy, 0, 10, 10)
          }
        } else {
          if (ox !== 1) {
            ox = lerp(ox, 0, CONSTANTS.PLANET_MAX_RADIUS * mult) // - p.HEIGHT / 2
            p.line(0, 0, 0, -ox)
            p.ellipse(0, -ox, 10, 10)
          }
          if (oy !== 1) {
            oy = lerp(oy, 0, CONSTANTS.PLANET_MAX_RADIUS * mult) // - p.HEIGHT / 2
            p.line(0, 0, 0, oy)
            p.ellipse(0, oy, 10, 10)
          }
        }
      }
      p.pop()
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
  const scaleY = (y - 300) / CONSTANTS.HEIGHT
  
  scale = scaleX > scaleY ? scaleY : scaleX
  if (scale > 1) scale = 0.8
  console.log('SCALE', scale)
  
  CONSTANTS.CANVAS_WIDTH_ORIG = CONSTANTS.CANVAS_WIDTH
  CONSTANTS.CANVAS_HEIGHT_ORIG = CONSTANTS.CANVAS_HEIGHT
  CONSTANTS.CANVAS_WIDTH = CONSTANTS.WIDTH
  CONSTANTS.CANVAS_HEIGHT = CONSTANTS.HEIGHT
  const socket = io()
  socket.on('connect', function () {
    new p5(sketch(socket, scale), 'game')
    setTimeout(() => {
      socket.emit('spectate')
    }, 500)
    setTimeout(() => {
      document.location.reload()
    }, 1000 * 60 * 10)
  })
}

function sqr(a) {
  return a*a;
}

function distance(x1, y1, x2, y2) {
  return Math.sqrt(sqr(y2 - y1) + sqr(x2 - x1));
}

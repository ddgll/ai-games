var context, scale, debug, chartData = [['Time', 'Reward', 'Loss']], chart, obs = true, human = true
const sketch = (socket, scale) => {
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
  let btn = document.getElementById('obs')
  btn.addEventListener('click', () => {
    obs = !obs
  })
  btn = document.getElementById('human')
  btn.addEventListener('click', () => {
    human = !human
    socket.emit('h', human)
  })
  btn = document.getElementById('learn')
  btn.addEventListener('click', () => {
    socket.emit('t')
  })
  const drawChart = (context) => {
    if (!context || !context.s || !context.s.length || !google || !google.visualization || !google.visualization.arrayToDataTable || !google.visualization.LineChart) return
    let sumR = 0, sumL = 0
    context.s.forEach(s => {
      sumR += s.re
      sumL += isNaN(s.lo) ? 0 : s.lo
    })
    const moyR = sumR / context.s.length
    const moyL = sumL / context.s.length
    if (chartData.length > 1000) chartData = []
    chartData.push([context.t, moyR, moyL])
    var data = google.visualization.arrayToDataTable(chartData);
    var options = {
      title: 'Training',
      curveType: 'function',
      legend: { position: 'bottom' }
    };

    if (!chart) chart = new google.visualization.LineChart(document.getElementById('chart'));

    chart.draw(data, options)
  }

  google.charts.load('current', {'packages':['corechart']});
  google.charts.setOnLoadCallback(drawChart)

  return (p) => {
    p.setup = function () {
      debug = p
      p.simul = true
      p.noStroke()
      const canvas = p.createCanvas(CONSTANTS.CANVAS_WIDTH, CONSTANTS.CANVAS_HEIGHT)
      p.frameRate(30)

      xCenter = CONSTANTS.CANVAS_WIDTH / 2
      yCenter = CONSTANTS.CANVAS_HEIGHT / 2

      let counter = 0

      socket.on('f', function (data) {
        context = new Context(data, p)
        context.setBounds(xCenter, yCenter)
        setFirst(data.context)
        if (counter++ === 100) {
          counter = 0
          drawChart(data.context)
        }
        
      })
      socket.on('c', function (ctx) {
        if (!context) return
        context.fromRemote(ctx)
      })
      socket.on('nb', function (nb_) {
        nb = nb_
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
  
  CONSTANTS.CANVAS_WIDTH = CONSTANTS.WIDTH
  CONSTANTS.CANVAS_HEIGHT = CONSTANTS.HEIGHT
  const socket = io()
  socket.on('connect', function () {
    new p5(sketch(socket, scale), 'game')
    setTimeout(() => {
      socket.emit('spectate')
    }, 1000)
  })
}

function sqr(a) {
  return a*a;
}

function distance(x1, y1, x2, y2) {
  return Math.sqrt(sqr(y2 - y1) + sqr(x2 - x1));
}

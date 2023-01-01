const io = require('socket.io-client')
const nameGenerator = require('../server/generator')
const Maths = require('../server/maths')
const CONSTANTS = require('../statics/js/constants')
const Bot = require('./bot-sensors')

const debug = true
const socket = io.connect('http://localhost:7770')
let bot

socket.on('connect', () => {
  const id = Maths.uuid()

  const enterGame = () => {
    let name = nameGenerator('general')
    console.log('SEND BOT Name', name)
    socket.emit('s', name)
  }

  socket.on('f', (data) => {
    if (!bot) {
      bot = new Bot(data)
    } else {
      bot.setFirstContext(data)
    }
  })
  socket.on('c', (ctx) => {
    if (bot) bot.context.fromRemote(ctx)
  })

  setInterval(() => {
    if (bot) {
      if (!bot.update()) {
        enterGame()
      }
      // } else if (bot.me) {
      //   let action = bot.get()
      //   if (!action) return
      //   if (debug) {
      //     // if (nc > 5) action = [0,0,0]
      //     socket.emit('mo', { c: action, id: id, o: bot.obstacles, t: { x: bot.target.x, y: bot.target.y }, a: bot ? bot.rotation : 0 })
      //   } else {
      //     // console.log('COords', target)
      //     socket.emit('m', action)
      //   }
      //   // velocity.x
      //   // target.y += velocity.y
      //   // console.log('TARGET', target, velocity)
      //   // socket.emit('m', [target.x, target.y])
      // }
    }
  }, CONSTANTS.SEND_TIME)

  setInterval(() => {
    if (!bot) return
    const d = new Date()
    const start = d.getTime()
    const coords = bot.think()
    const f = new Date()
    const fin = f.getTime()
    console.log('TIME TO Think', fin - start, 'ms', bot.brain.age)
    if (coords !== null) {
      if (debug) {
        socket.emit('mo', { c: [coords.x, coords.y], id: id, t: coords, o: bot.obstacles, a: bot ? bot.rotation : 0 })
        // if (nc > 5) action = [0,0,0]
      } else {
        // console.log('COords', target)
        socket.emit('m', [coords.x, coords.y])
      }
    }
    // console.log(coords)
  }, CONSTANTS.TIME)

  enterGame()
})



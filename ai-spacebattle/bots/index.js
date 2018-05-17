const io = require('socket.io-client')
const nameGenerator = require('../server/generator')
const CONSTANTS = require('../statics/js/constants')
const Bot = require('./bot')

const socket = io.connect('http://localhost:7770')
socket.on('connect', () => {
  let me, bot, name

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
    if (bot) bot.context.update()
  }, 30)

  setInterval(() => {
    if (!bot) return
    // const bonuses = Object.values(bot.context.bonuses)
    const bonuses = []
    const d = new Date()
    const start = d.getTime()
    const coords = bot.think()
    const f = new Date()
    const fin = f.getTime()
    console.log('TIME TO Think', fin - start, 'ms', bot.brain.age)
    if (coords === null) {
      enterGame()
    } else {
      socket.emit('m', [coords.x, coords.y])
    }
    // console.log(coords)
  }, 400)

  enterGame()
})



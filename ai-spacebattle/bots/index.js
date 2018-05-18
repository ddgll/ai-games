const io = require('socket.io-client')
const nameGenerator = require('../server/generator')
const CONSTANTS = require('../statics/js/constants')
const Bot = require('./bot')

const debug = false
let bot

const socket = io.connect('http://localhost:7770')
// const socket = io.connect('http://space-battle.io')
socket.on('connect', () => {

  const enterGame = () => {
    let name = nameGenerator('general')
    // console.log('SEND BOT Name', name)
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
  // socket.on('die', (id) => {
  //   if (bot && bot.me && bot.me.id && bot.me.id === id) {
  //     console.log('BOT DEAD Re-enter game from die', id, bot.me.id)
  //     bot.me = null
  //     enterGame()
  //   }
  // })

  
  socket.on('disconnect', (ctx) => {
    bot = null
  })

  setInterval(() => {
    if (bot && !bot.update()) {
      // console.log('BOT DEAD Re-enter game from die')
      enterGame()
    }
  }, 30)

  let nc = 0
  setInterval(() => {
    if (!bot || !bot.me || !bot.me.id) return
    // const bonuses = Object.values(bot.context.bonuses)
    const bonuses = []
    const d = new Date()
    const start = d.getTime()
    const coords = bot.think()
    const f = new Date()
    const fin = f.getTime()
    if (fin - start > 400) console.log('TIME TO Think too large !!', fin - start, 'ms', bot.brain.age)
    if (bot.brain.age % 100 === 0) console.log('TIME TO Think', fin - start, 'ms', bot.brain.age)
    if (coords && coords.x && coords.y) {
      nc = 0
      if (debug) {
        socket.emit('mo', { c: [coords.x, coords.y], o: bot.obstacles })
      } else {
        // console.log('COords', coords)
        socket.emit('m', [coords.x, coords.y])
      }
    } else {
      nc++
      console.log('NO COORDS', nc)
      if (nc > 5) {
        bot.me = null
        enterGame()
      }
    }
    // console.log(coords)
  }, 400)

  if (!bot) enterGame()
})



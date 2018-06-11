const io = require('socket.io-client')
const nameGenerator = require('../server/generator')
const Maths = require('../server/maths')
const CONSTANTS = require('../statics/js/constants')
const Bot = require('./bot-keyboard')

const debug = false
let bot, counter = 0

const socket = io.connect('http://localhost:7770')
// const socket = io.connect('http://space-battle.io')
socket.on('connect', () => {
  const id = Maths.uuid()

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
  socket.on('e', (epsilon) => {
    if (bot) bot.brain.epsilon = epsilon
  })

  
  socket.on('die', (id) => {
    if (bot && bot.me && bot.me.id && bot.me.id === id) {
      console.log('BOT DEAD Re-enter game from die', id, bot.me.id)
      bot.me = null
      enterGame()
    }
  })
  let nc = 0

  setInterval(() => {
    if (bot) {
      if (!bot.update(nc)) {
        enterGame()
      } else if (bot.me) {
        // console.log(coords)
        let action = bot.get()
        if (debug) {
          // if (nc > 5) action = [0,0,0]
          socket.emit('ko', { c: action, id: id, o: bot.obstacles, a: bot ? bot.rotation : 0 })
        } else {
          // console.log('COords', target)
          socket.emit('k', action)
        }
        // velocity.x
        // target.y += velocity.y
        // console.log('TARGET', target, velocity)
        // socket.emit('m', [target.x, target.y])
      }
    }
  }, CONSTANTS.SEND_TIME)

  setInterval(() => {
    console.clear()
    if (!bot || !bot.me || !bot.me.id) return
    nc++
    // const bonuses = Object.values(bot.context.bonuses)
    const bonuses = []
    const d = new Date()
    const start = d.getTime()
    bot.think()
    const f = new Date()
    const fin = f.getTime()
    if (fin - start > CONSTANTS.TIME) console.log('TIME TO Think too large !!', fin - start, 'ms', nc)
    console.log('TIME TO Think', fin - start, 'ms', nc, bot.label, bot.brain.epsilon)
  }, CONSTANTS.TIME)

  if (!bot) {
    setTimeout(() => {
      console.log('START Bot')
      enterGame()
    }, 1000)
  }
})

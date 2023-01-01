const io = require('socket.io-client')
const nameGenerator = require('../server/generator')
const Maths = require('../server/maths')
const CONSTANTS = require('../statics/js/constants')
const Bot = require('./bot-target')

const debug = true
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
      if (!bot.update()) {
        enterGame()
      } else if (bot.me) {
        let action = bot.get()
        if (!action) return
        if (debug) {
          // if (nc > 5) action = [0,0,0]
          socket.emit('mo', { c: action, id: id, o: bot.obstacles, t: { x: bot.target.x, y: bot.target.y }, a: bot ? bot.rotation : 0 })
        } else {
          // console.log('COords', target)
          socket.emit('m', action)
        }
        // velocity.x
        // target.y += velocity.y
        // console.log('TARGET', target, velocity)
        // socket.emit('m', [target.x, target.y])
      }
    }
  }, CONSTANTS.SEND_TIME)

  setInterval(() => {
    if (!bot || !bot.me || !bot.me.id) return
    nc++
    // const bonuses = Object.values(bot.context.bonuses)
    const bonuses = []
    const d = new Date()
    const start = d.getTime()
    bot.think()
    const f = new Date()
    const fin = f.getTime()
    if (fin - start > CONSTANTS.TIME) console.log('TIME TO Think too large !!', fin - start, 'ms', bot.brain.age)
    if (bot.brain.age % 100 === 0) console.log('TIME TO Think', fin - start, 'ms', bot.brain.age)
  }, CONSTANTS.TIME)

  if (!bot) enterGame()
})

const io = require('socket.io-client')
const nameGenerator = require('../server/generator')
const Maths = require('../server/maths')
const CONSTANTS = require('../statics/js/constants')

const Bot = require('./bot')

module.exports = (type, brain, debug = false, url = 'http://space-battle.io') => {
  let bot
  // const socket = io.connect('http://localhost:7770')
  const socket = io.connect(url)
  socket.on('connect', () => {
    const id = Maths.uuid()
    let name = type

    const enterGame = () => {
      // name = nameGenerator('general')
      socket.emit('s', name)
    }
    socket.on('f', (data) => {
      if (!bot) {
        bot = new Bot(data, brain, type)
      } else {
        bot.setFirstContext(data)
      }
    })
    socket.on('c', (ctx) => {
      if (bot) bot.context.fromRemote(ctx)
    })
    socket.on('e', (epsilon) => {
      if (!bot) return
      if (typeof bot.onE === 'function') bot.onE(epsilon)
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

    const botThink = () => {
      if (!bot || !bot.me || !bot.me.id) {
        setTimeout(botThink, CONSTANTS.TIME)
        return
      }
      nc++
      const s = Date.now()
      bot.think()
      const f = Date.now()
      const d = f - s
      bot.console(d, name, nc)
      if (d >= CONSTANTS.TIME) {
        botThink()
      } else {
        setTimeout(botThink, CONSTANTS.TIME - d)
      }
    }
    botThink()

    if (!bot) {
      setTimeout(() => {
        console.log('START Bot')
        enterGame()
      }, 1000)
    }
  })
}


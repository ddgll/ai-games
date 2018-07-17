const io = require('socket.io-client')
const nameGenerator = require('../server/generator')
const CONSTANTS = require('../statics/js/constants')

const Bot = require('../bots-keyboard/bot')

module.exports = class BotSocket extends Bot {
  constructor (brain, index, die, url = 'http://space-battle.io', debug = false) {
    super(null, brain, 'ga')
    this.socket = io.connect(url)
    this.start = null
    this.last = null

    this.index = index
    this.die = die
    this.dead = false
    this.frames = 0

    this.name = nameGenerator('general')
    this.socket.on('connect', this.onConnect.bind(this))
    this.socket.on('f', this.onFirstContext.bind(this))
    this.socket.on('c', this.onGetContext.bind(this))
    this.socket.on('die', (id) => {
      this.socket.disconnect()
    })
    this.socket.on('dienow', this.socket.disconnect)
    this.socket.on('disconnect', this.onDisconnect.bind(this))
  }

  onConnect () {
    this.id = this.socket.id
    this.socket.emit('s', this.name)
  }

  onFirstContext (c) {
    // console.log('First context bot', this.index)
    this.start = Date.now()
    this.last = this.start
    this.setFirstContext(c)
    this.think()
  }

  onGetContext (context) {
    if (this.start === null) return
    this.last = Date.now()
    this.frames++
    this.update(context)
  }

  onDisconnect () {
    // console.log('ON DISCONNECT')
    this.dead = true
    if (this.thinkTimeout) clearTimeout(this.thinkTimeout)
    this.die(this.id, this.index, Math.round(this.frames / 100))
  }
  
  think() {
    if (this.thinkTimeout) clearTimeout(this.thinkTimeout)
    if (this.dead) return
    // console.log('THINKND', this.index)
    const s = Date.now()
    super.think()
    const action = this.get()
    this.socket.emit('k', action)
    // this.socket.emit('ko', { c: action, id: this.id, o: this.obstacles, a: this.rotation })
    const f = Date.now()
    const d = f - s
    if (d >= CONSTANTS.TIME) {
      this.think()
    } else {
      this.thinkTimeout = setTimeout(this.think.bind(this), CONSTANTS.TIME - d)
    }
    const activity = f - this.last
    if (activity > 3000 || this.frames > 10000) {
      // console.log('DISCONNECT FOR Inactivity', activity, this.frames)
      this.socket.disconnect()
    }
  }
}

// module.exports = (brain, index, die, url = 'http://space-battle.io', debug = false) => {
//   let id, bot, sendInterval, thinkTimeout, dead = false

//   const socket = io.connect(url)
//   socket.on('connect', () => {
//     let name = null
//     let last = Date.now()
//     const debut = Date.now()
//     const end = (id) => {
//       if (bot && bot.me && bot.me.id && bot.me.id === id) {
//         dead = true
//         const now = Date.now()
//         if (sendInterval) clearInterval(sendInterval)
//         if (thinkTimeout) clearTimeout(thinkTimeout)
//         die(socket.id, index, ((now - debut) / 1000) + bot.score)
//       }
//     }

//     const enterGame = () => {
//       name = nameGenerator('general')
//       socket.emit('s', name)
//     }
//     socket.on('f', (data) => {
//       if (!bot) {
//         bot = new Bot(data, brain, 'ga')
//         botThink()
//       }
//     })
//     socket.on('c', (ctx) => {
//       if (bot) {
//         last = Date.now()
//         bot.context.fromRemote(ctx)
//       } else if (name) {
//         last = Date.now()
//       }
//     })
//     socket.on('die', (idx) => {
//       if (idx === index) socket.disconnect()
//     })
//     socket.on('dienow', () => socket.disconnect())
//     socket.on('disconnect', () => end(id))
    
//     let nc = 0
//     sendInterval = setInterval(() => {
//       if (bot) bot.update(nc++)
//       if (!bot || !bot.me || !bot.me.id) return
//       console.log('SEND')
//       const now = Date.now()
//       const activity = now - last
//       if ((activity > 3000 && id) || nc > 10000) return socket.disconnect()
//       id = bot.me.id
//       let action = bot.get()
//       socket.emit('k', action)
//     }, CONSTANTS.SEND_TIME)

//     const botThink = () => {
//       if (dead) return
//       if (thinkTimeout) clearTimeout(thinkTimeout)
//       if (!bot || !bot.me || !bot.me.id) {
//         thinkTimeout = setTimeout(botThink, CONSTANTS.TIME)
//         return
//       }
//       console.log('THINKND', index)
//       const s = Date.now()
//       bot.think()
//       const f = Date.now()
//       const d = f - s
//       bot.console(d, name, nc)
//       if (d >= CONSTANTS.TIME) {
//         botThink()
//       } else {
//         thinkTimeout = setTimeout(botThink, CONSTANTS.TIME - d)
//       }
//     }
//     if (!bot) enterGame()
//   })

//   return socket
// }

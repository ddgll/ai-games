const { fork } = require('child_process')
const path = require('path')
const types = require('./bot-types')

const listenerPath = path.join(__dirname, './bot-listener.js')
let nb = 0
const close = () => {
  nb--
  if (nb === 0) {
    console.log('ALL Bots are closed, end process')
    process.exit()
  }
}

types.forEach(type => {
  const child = fork(listenerPath)
  child.send(type)
  child.on('close', close)
  nb++
})

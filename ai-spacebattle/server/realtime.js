
const Game = require('./game')

var game

module.exports = function (io) {
  if (!game) game = new Game(io)
  return function (socket) {
    const context = game.addShip()
    const id = context.ship.id
    console.log('Client connexion', id)
    socket.emit('f', context)

    socket.on('disconnect', () => {
      console.log('Client disconnect', id)
      game.removeShip(id)
    })

    socket.on('m', ([x, y]) => {
      game.moveShip(id, x, y)
    })

    socket.on('c', ([x, y]) => {
      game.shoot(id, x, y)
    })

    // socket.on('u', () => {
    //   game.context.update()
    // })

    // socket.on('s', () => {
    //   const window = game.context.getWindow()
    //   console.log('SEND Window', window)
    //   io.of('/').emit('c', window)
    // })
  }
}


const Game = require('./game')
const Ga = require('./ga')

var game, ga

module.exports = function (io) {
  if (!game) {
    game = new Game(io)
    ga = new Ga(game, 46, 3)
    game.context.setGameOver(ga.endEvolution.bind(ga))
    ga.startEvolution()
  }
  
  return function (socket) {
    let context
    let id

    socket.on('disconnect', () => {
      console.log('Client disconnect', id)
      game.removeShip(id)
    })

    socket.on('s', (name) => {
      if (!name || !name.length || name.length > 10 || name.length < 3) return
      name = name.replace(/\|/g, '')
      console.log('Client connexion', name)
      if (!id || !game.context.ships.find(s => s.id === id)) {
        context = game.addShip(name)
        id = context.ship.id
        socket.emit('f', context)
      }
    })

    socket.on('spectate', (name) => {
      socket.emit('f', { context: game.context.getContext() })
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

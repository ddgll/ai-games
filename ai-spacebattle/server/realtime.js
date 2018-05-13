'use strict';

const Game = require('./game')
const Ga = require('./ga')

module.exports = function (io) {

  var game, ga

  if (!game) {
    game = new Game(io)
    ga = new Ga(game, 39, 8, io)
    game.context.setGameOver(ga.endEvolution.bind(ga))
    ga.startEvolution()
    // game.startIntervals()
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

    socket.on('b', () => {
      if (ga && ga.bestBrain) socket.emit('brain', ga.bestBrain)
    })

    socket.on('h', (bool) => {
      console.log('SET HUMAN', bool)
      game.setHuman(bool)
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

'use strict';

const Game = require('./game')
var game
module.exports = function (io) {

  if (!game) {
    console.log('CREATE NEW Game')
    game = new Game(io)
    game.startIntervals()
  }
  
  return function (socket) {
    let context
    let id
    let name

    socket.on('disconnect', () => {
      if (id) {
        console.log('Client disconnect', name)
        game.removeShip(id)
      }
    })

    socket.on('s', (name_) => {
      if (!name_ || !name_.length) return
      name = name_.replace(/\|/g, '')
      console.log('Client connexion', name)
      if (!id || !game.context.ships.find(s => s.id === id)) {
        context = game.addShip(name, socket.id)
        id = context.ship.id
        socket.emit('f', context)
      }
    })

    socket.on('spectate', (name) => {
      socket.emit('f', { context: game.context.getContext() })
    })
    socket.on('killallbots', () => {
      io.emit('dienow')
    })

    socket.on('m', ([x, y]) => {
      game.moveShip(id, x, y)
    })

    socket.on('k', ([boosting, angle, fire]) => {
      game.moveKeyboardShip(id, boosting, angle, fire)
    })

    socket.on('ko', (data) => {
      game.moveKeyboardShip(id, data.c[0], data.c[1], data.c[2])
      io.emit('o', { id, o: data.o, t: data.t, a: data.a })
    })

    socket.on('mo', (data) => {
      // { c: [x, y], id, o }
      game.moveShip(id, data.c[0], data.c[1])
      io.emit('o', { id, o: data.o, t: data.t, a: data.a })
    })

    socket.on('c', ([x, y]) => {
      game.shoot(id, x, y)
    })
  }
}

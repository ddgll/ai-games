'use strict';

const Game = require('./game')
const Ga = require('./ga')
const fs = require('fs')
const path = require('path')

module.exports = function (io) {

  var game, ga

  if (!game) {
    game = new Game(io)
    game.startIntervals()
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

    socket.on('k', ([boosting, angle, fire]) => {
      game.moveKeyboardShip(id, boosting, angle, fire)
    })

    socket.on('ko', (data) => {
      game.moveKeyboardShip(id, data.c[0], data.c[1], data.c[2])
      io.emit('o', { id: data.id, ship: id, o: data.o, a: data.a })
    })

    socket.on('mo', (data) => {
      // { c: [x, y], id, o }
      game.moveShip(id, data.c[0], data.c[1])
      io.emit('o', { id: data.id, ship: id, o: data.o, a: data.a })
    })

    socket.on('d', (id) => {
      const exists = game.exists(id)
      console.log('CHECK Existance', id, exists)
    })

    socket.on('c', ([x, y]) => {
      console.log('SHOOT !')
      game.shoot(id, x, y)
    })
  }
}

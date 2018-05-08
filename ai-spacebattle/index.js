const path = require('path')
const express = require('express')
const app = express()
const http = require('http').Server(app)
const io = require('socket.io')(http)
const realtime = require('./server/realtime.js')

var options = {
  dotfiles: 'ignore',
  etag: false,
  extensions: ['js', 'css'],
  index: false,
  maxAge: '1d',
  redirect: false,
  setHeaders: function (res) {
    res.set('x-timestamp', Date.now())
  }
}

app.use(express.static('statics', options))

app.get('/', (req, res) => res.sendFile(path.resolve('./index.html')))

io.on('connection', realtime(io))

http.listen(7770, () => {
  console.log('Server listening http://localhost:7770')
})

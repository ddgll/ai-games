const path = require('path')
const express = require('express')
const app = express()

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
app.get('/race', (req, res) => res.sendFile(path.resolve('./race.html')))

app.listen(7779, () => {
  console.log('Server listening http://localhost:7779')
})

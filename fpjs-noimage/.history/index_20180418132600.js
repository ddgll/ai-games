const express = require('express')
const app = express()

express.static('./js')

app.get('*', (req, res) => res.sendFile('./index.html'))

app.listen(7777, () => {
  console.log('Server listening http://localhost:7777')
})

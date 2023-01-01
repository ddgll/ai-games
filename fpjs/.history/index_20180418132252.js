const express = require('express')
const app = express()

express.static('./js')

app.get('*', (req, res) => res.send('./index.html'))

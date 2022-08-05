const express = require('express')
const initAPIs = require('./api/index')

const app = express()

initAPIs(app)

const host = 'http://127.0.0.1'
const port = 3000

app.listen(port, err => {
  if (!err) {
    console.log(`${ host }:${ port }`)
  }
})
'use strict'

require('../models')
const config = require('config')
const app = require('../app')

app.listen(config.port, () => {
  console.log(`Server listening on port => ${config.port} at ${new Date()}`)
})

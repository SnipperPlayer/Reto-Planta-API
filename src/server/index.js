const mkHandlers = require('./handlers')
const mkServer = require('./server')
const app = require('../app')
const port = process.env.PORT

const handlers = mkHandlers({ app })
const server = mkServer({ port, handlers })

module.exports = server

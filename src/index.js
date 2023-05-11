const server = require('./server')

server.start()
  .then(() => console.log('Server started'))
  .catch(err => console.error(err))

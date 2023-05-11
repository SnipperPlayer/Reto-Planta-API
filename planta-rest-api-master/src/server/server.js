const express = require('express')

module.exports = function mkServer ({ port, handlers }) {
  return Object.freeze({
    start,
  })


  async function start () {
    const routes = mkRoutes()
    const app = mkApp(routes)

    return new Promise(function (resolve, reject) {
      app.listen(port, function (err) {
        if (err) reject(err)
        else resolve()
      })
    })
  }


  function mkApp (routes) {
    const app = express()

    /// CORS
    app.use(function (req, res, next) {
      res.header('Access-Control-Allow-Origin', '*')
      res.header('Access-Control-Allow-Headers', 'Authorization, Origin, X-Requested-With, Content-Type, Accept')
      next()
    })

    /// BODY PARSING
    app.use(express.json())

    /// ROUTES
    app.use(routes)

    /// ERROR HANDLING
    app.use(function (err, req, res, _next) {
      console.error(err)
      if (err.statusCode) {
        res.status(err.statusCode).send(err.message)
      } else {
        res.status(500).send(`Unhandled server error: ${err.message}\n`)
      }
    })

    return app
  }


  function mkRoutes () {
    const app = express()
    app.get('/', mountHandler(handlers.index))
    app.post('/user/create', mountHandler(handlers.userCreate))
    app.post('/user/login', mountHandler(handlers.userLogin))
    app.get('/plant', mountHandler(handlers.plant))
    app.get('/plant/dataKinds/:pID', mountHandler(handlers.plantDataKinds))
    app.get('/plant/data/:pID/:kID', mountHandler(handlers.plantData))
    app.post('/plant/data/:plantName/:kindName/:value', mountHandler(handlers.plantDataCreate))
    return app
  }


  function mountHandler (handler) {
    return function (req, res) {
      handler(req)
        .then(({ json, status, text }) => {
          /// LOG
          console.group(`${req.method} ${req.originalUrl}`)
          console.log(`body: ${JSON.stringify(req.body)}`)
          console.log(`status: ${status}`)
          let response = (function () {
            if (json) return JSON.stringify(json)
            if (text) return text
            return '<no response>'
          })()
          console.log(`response: ${response}`)
          console.groupEnd()
          /// RESPONSE
          res.status(status)
          if (json) return res.json(json)
          if (text) return res.send(`${text}\n`)
          res.end()
        })
        .catch(err => {
          console.error(err)
          res.status(500).send(`unhandled server error: ${err.message}\n`)
        })
    }
  }
}

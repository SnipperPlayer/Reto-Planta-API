const mkApp = require('./app')
const db = require('../db/aws-mysql-db')

const app = mkApp({ db })

module.exports = app

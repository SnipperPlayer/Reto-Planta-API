const getDb = require('./db')
const mkData = require('./in-memory-db')

const data = mkData({ getDb })

module.exports = data

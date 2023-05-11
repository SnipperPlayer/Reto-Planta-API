const mysql = require('mysql')
const mkData = require('./aws-mysql-db')

const options = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
}

const pool = mysql.createPool(options)

async function all (...args) {
  return new Promise(function (resolve, reject) {
    pool.query(...args, function (err, results) {
      if (err) {
        reject(err)
      } else {
        resolve(results)
      }
    })
  })
}

async function get (...args) {
  return new Promise(function (resolve, reject) {
    pool.query(...args, function (err, results) {
      if (err) {
        reject(err)
      } else {
        resolve(results[0])
      }
    })
  })
}

async function run (...args) {
  return new Promise(function (resolve, reject) {
    pool.query(...args, function (err) {
      if (err) {
        reject(err)
      } else {
        resolve()
      }
    })
  })
}

const db = {
  all,
  get,
  run,
}

const data = mkData({ db })

module.exports = data

const mkAuth = require('./auth')
const jwt = require('jsonwebtoken')
const secret = process.env.JWT_SECRET || 'secret'


async function sign ({ payload }) {
  return new Promise(function (resolve, reject) {
    jwt.sign(payload, secret, function (err, token) {
      if (err) {
        reject(err)
      } else {
        resolve(token)
      }
    })
  })
}


async function verify ({ token }) {
  return new Promise(function (resolve, reject) {
    jwt.verify(token, secret, function (err, decoded) {
      if (err) {
        reject(err)
      } else {
        resolve(decoded)
      }
    })
  })
}


const auth = mkAuth({ sign, verify })

module.exports = auth

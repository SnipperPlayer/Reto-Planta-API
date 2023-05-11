const sqlite3 = require('sqlite3').verbose()

let db = undefined

async function serialize (fn) {
  return new Promise(function (resolve, reject) {
    db.serialize(function () {
      fn().then(resolve).catch(reject)
    })
  })
}

async function run (...args) {
  return new Promise(function (resolve, reject) {
    db.run(...args, (err) => {
      if (err) {
        return reject(err)
      }
      resolve()
    })
  })
}

async function all (...args) {
  return new Promise(function (resolve, reject) {
    db.all(...args, (err, rows) => {
      if (err) {
        return reject(err)
      }
      resolve(rows)
    })
  })
}

async function get (...args) {
  return new Promise(function (resolve, reject) {
    db.get(...args, (err, result) => {
      if (err) {
        return reject(err)
      }
      resolve(result)
    })
  })
}

async function setup () {
  await serialize(async function () {
    // language=SQLite
    const userTable =
      `CREATE TABLE IF NOT EXISTS user
       (
           uID          INTEGER PRIMARY KEY AUTOINCREMENT,
           username     VARCHAR(30)  NOT NULL,
           passwordHash VARCHAR(256) NOT NULL,
           UNIQUE (username)
       )`
    // language=SQLite
    const kindTable =
      `CREATE TABLE IF NOT EXISTS kind
       (
           kID   INTEGER PRIMARY KEY AUTOINCREMENT,
           kName VARCHAR(30) NOT NULL,
           UNIQUE (kName)
       )`
    // language=SQLite
    const plantTable =
      `CREATE TABLE IF NOT EXISTS plant
       (
           pID   INTEGER PRIMARY KEY AUTOINCREMENT,
           pName VARCHAR(30) NOT NULL,
           uID   INTEGER     NOT NULL,
           FOREIGN KEY (uID) REFERENCES user (uID),
           UNIQUE (uID, pName)
       )`
    // language=SQLite
    const dataTable =
      `CREATE TABLE IF NOT EXISTS data
       (
           dID   INTEGER PRIMARY KEY AUTOINCREMENT,
           date  DATE DEFAULT (current_date) NOT NULL,
           time  TIME DEFAULT (current_time) NOT NULL,
           pID   INTEGER NOT NULL,
           kID   INTEGER NOT NULL,
           value INTEGER NOT NULL,
           FOREIGN KEY (pID) REFERENCES plant (pID),
           FOREIGN KEY (kID) REFERENCES kind (kID),
           UNIQUE (date, time, pID, kID)
       )`

    await run(userTable)
    await run(kindTable)
    await run(plantTable)
    await run(dataTable)
  })
}

module.exports = async function getDb () {
  if (db === undefined) {
    console.log('Starting in memory db ...')
    db = new sqlite3.Database(':memory:')
    await setup()
    console.log('In memory db ready!')
  }

  return Object.freeze({
    serialize,
    run,
    all,
    get,
  })
}

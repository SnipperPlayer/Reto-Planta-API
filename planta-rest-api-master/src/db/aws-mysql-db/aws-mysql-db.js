module.exports = function mkData ({ db }) {
  return Object.freeze({
    allPlantData,
    allPlantDataKinds,
    allUserPlants,
    insertPlantData,
    insertUser,
    findCreatePlant,
    findCreateKind,
    findPlantById,
    findUser,
  })


  async function allPlantData ({ pID, kID }) {
    // language=MySQL
    const query =
      `SELECT date, time, value
       FROM data
       WHERE pID = ?
         AND kID = ?
      `
    return db.all(query, [ pID, kID ])
  }


  async function allPlantDataKinds ({ pID }) {
    // language=MySQL
    const query =
      `SELECT DISTINCT k.kID, k.name as kName
       FROM plant p
                JOIN data d on p.pID = d.pID
                JOIN kind k on d.kID = k.kID
       WHERE p.pID = ?
      `
    return db.all(query, [ pID ])
  }


  async function allUserPlants ({ uID }) {
    // language=MySQL
    const query =
      `SELECT pID, pName
       FROM plant
       WHERE uID = ?
      `
    return db.all(query, [ uID ])
  }


  async function insertPlantData ({ pID, kID, value }) {
    function dataExistsError () {
      const e = new Error('data already exists')
      e.name = 'DataExistsError'
      return e
    }

    // language=MySQL
    const query =
      `INSERT INTO data (pID, kID, value)
       VALUES (?, ?, ?)
      `
    return db.run(query, [ pID, kID, value ])
      .catch(e => {
        if (e.code === 'ER_DUP_ENTRY')
          throw dataExistsError()
        throw e
      })
  }


  async function insertUser ({ username, passwordHash }) {
    function userExistsError () {
      const e = new Error('user exists')
      e.name = 'UserExists'
      return e
    }

    // language=MySQL
    const query =
      `INSERT INTO user (uName, uPwHash)
       VALUES (?, ?)
      `
    return db.run(query, [ username, passwordHash ])
      .catch(e => {
        if (e.code === 'ER_DUP_ENTRY')
          throw userExistsError()
        throw e
      })
  }


  async function findCreatePlant ({ plantName, uID }) {
    async function find () {
      // language=MySQL
      const query =
        `SELECT pID, pName
         FROM plant
         WHERE pName = ?
            AND uID = ?
        `
      return db.get(query, [ plantName, uID ])
    }

    async function create () {
      // language=MySQL
      const query =
        `INSERT INTO plant (pName, uID)
         VALUES (?, ?)
        `
      return db.run(query, [ plantName, uID ])
    }

    return findCreate({ find, create, name: 'plant' })
  }


  async function findCreateKind ({ kindName }) {
    async function find () {
      // language=MySQL
      const query =
        `SELECT kID, name as kName
         FROM kind
         WHERE name = ?
        `
      return db.get(query, [ kindName ])
    }

    async function create () {
      // language=MySQL
      const query =
        `INSERT INTO kind (name)
         VALUES (?)
        `
      return db.run(query, [ kindName ])
    }

    return findCreate({ find, create, name: 'kind' })
  }


  async function findPlantById ({ pID }) {
    function plantNotFoundError () {
      const e = new Error('plant not found')
      e.name = 'PlantNotFound'
      return e
    }

    // language=MySQL
    const query =
      `SELECT uID, pID, pName
       FROM plant
       WHERE pID = ?
      `
    return db.get(query, [ pID ])
      .then(plant => {
        if (!plant) throw plantNotFoundError()
        return plant
      })
  }


  async function findUser ({ username }) {
    function userNotFoundError () {
      const e = new Error('user not found')
      e.name = 'UserNotFound'
      return e
    }

    // language=MySQL
    const query =
      `SELECT uID, uName as username, uPwHash as passwordHash
       FROM user
       WHERE uName = ?
      `

    return db.get(query, [ username ])
      .then(user => {
        if (!user) throw userNotFoundError()
        return user
      })
  }


  //////////////////////////////////////////////////////////////////////////////


  async function findCreate ({ find, create, name }) {
    function findCreateError (name) {
      const e = new Error(`failed to create: ${name}`)
      e.name = 'FindCreateError'
      return e
    }

    let result = await find()
    if (result) return result
    await create()
    result = await find()

    if (result) return result
    throw findCreateError(name)
  }
}

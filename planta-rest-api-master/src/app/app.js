const { validateId } = require('../data/id')
const { validatePassword } = require('../data/password')
const { validatePasswordHash } = require('../data/password-hash')
const { validateUsername } = require('../data/username')
const { validateValue } = require('../data/value')
const hashing = require('../data/hashing')

module.exports = function mkApp ({ db }) {
  return Object.freeze({
    createUser,
    createPlantData,
    findUser,
    listPlants,
    listPlantDataKinds,
    listPlantData,
    login,
    userOwnsPlant,
  })


  async function createUser ({ username, password }) {
    validateUsername({ username })
    validatePassword({ password })
    const passwordHash = await hashing.hash(password)
    validatePasswordHash({ passwordHash })
    await db.insertUser({ username, passwordHash })
  }


  async function findUser ({ username }) {
    validateUsername({ username })
    const user = await db.findUser({ username })
    return { uID: user.uID }
  }


  async function login ({ username, password }) {
    validateUsername({ username })
    validatePassword({ password })
    const user = await db.findUser({ username })
    const valid = await hashing.compare(password, user.passwordHash)
    if (!valid) {
      const e = new Error('password is incorrect')
      e.name = 'IncorrectPassword'
      throw e
    }

    return {
      uID: user.uID,
    }
  }


  async function listPlants ({ uID }) {
    validateId({ id: uID })
    const plants = await db.allUserPlants({ uID })
    return plants.map(({ pID, pName }) => ({ pID, pName }))
  }


  async function listPlantDataKinds ({ pID }) {
    validateId({ id: pID })
    const dataKinds = await db.allPlantDataKinds({ pID })
    return dataKinds.map(({ kID, kName }) => ({ kID, kName }))
  }


  async function listPlantData ({ pID, kID }) {
    validateId({ id: pID })
    validateId({ id: kID })
    const data = await db.allPlantData({ pID, kID })
    return data.map(({ date, time, value }) => ({ date, time, value }))
  }


  async function createPlantData ({ uID, plantName, kindName, value }) {
    validateId({ id: uID })
    validateValue({ value })
    const { pID } = await db.findCreatePlant({ plantName, uID })
    const { kID } = await db.findCreateKind({ kindName })
    await db.insertPlantData({ pID, kID, value })
  }


  async function userOwnsPlant ({ uID, pID }) {
    validateId({ id: uID })
    validateId({ id: pID })
    try {
      const { uID: ownerID } = await db.findPlantById({ pID })
      return { owns: uID === ownerID }
    } catch (e) {
      if (e.name === 'PlantNotFound') {
        return { owns: false }
      } else {
        throw e
      }
    }
  }
}

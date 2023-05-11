const auth = require('../auth')

const fail = (msg) => ({
  status: 400,
  text: msg,
  isError: true,
})

const ok = ({ json, text }) => ({
  status: 200,
  json,
  text,
})

const unauthorized = {
  status: 401,
  text: 'Unauthorized',
}

const forbidden = {
  status: 403,
  text: 'Forbidden',
}


module.exports = function mkHandlers ({ app }) {
  return Object.freeze({
    index,
    userCreate,
    userLogin,
    plant,
    plantDataKinds,
    plantData,
    plantDataCreate,
  })


  async function index (_req) {
    return {
      status: 200,
      text: 'Hello, world!',
    }
  }


  async function userCreate (req) {
    const body = validateObject(req.body, {
      username: 'string',
      password: 'string',
    })
    if (body.isError) return body
    const { username, password } = body

    try {
      await app.createUser({ username, password })
      return ok({ json: { created: true } })
    } catch (e) {
      return handleError(e)
    }
  }


  async function userLogin (req) {
    const body = validateObject(req.body, {
      username: 'string',
      password: 'string',
    })
    if (body.isError) return body
    const { username, password } = body

    try {
      const { uID } = await app.login({ username, password })
      const { token } = await auth.createToken({ payload: { uID } })
      return ok({ json: { token } })
    } catch (e) {
      return handleError(e)
    }
  }


  async function plant (req) {
    const session = await authenticate(req)
    if (!session) return unauthorized
    const { uID } = session

    try {
      const plants = await app.listPlants({ uID })
      return ok({ json: { plants } })
    } catch (e) {
      return handleError(e)
    }
  }


  async function plantDataKinds (req) {
    const params = validateObject(req.params, {
      pID: 'number',
    })
    if (params.isError) return params
    const session = await authenticate(req)
    if (!session) return unauthorized

    const { uID } = session
    const { pID } = params

    try {
      const { owns: allowed } = await app.userOwnsPlant({ uID, pID })
      if (!allowed) return forbidden

      const kinds = await app.listPlantDataKinds({ pID })
      return ok({ json: { kinds } })
    } catch (e) {
      return handleError(e)
    }
  }


  async function plantData (req) {
    const params = validateObject(req.params, {
      pID: 'number',
      kID: 'number'
    })
    if (params.isError) return params
    const session = await authenticate(req)
    if (!session) return unauthorized

    const { uID } = session
    const { pID, kID } = params

    try {
      const { owns: allowed } = await app.userOwnsPlant({ uID, pID })
      if (!allowed) return forbidden

      const data = await app.listPlantData({ pID, kID })
      return ok({ json: { data } })
    } catch (e) {
      return handleError(e)
    }
  }


  async function plantDataCreate (req) {
    const params = validateObject(req.params, {
      plantName: 'string',
      kindName: 'string',
      value: 'number',
    })
    if (params.isError) return params
    const { plantName, kindName, value } = params

    const session = await authenticate(req)
    if (!session) return unauthorized
    const { uID } = session

    try {
      await app.createPlantData({ uID, plantName, kindName, value })
      return ok({ json: { created: true } })
    } catch (e) {
      return handleError(e)
    }
  }


  //////////////////////////////////////////////////////////////////////////////


  async function authenticate (req) {
    const header = req.get('authorization')
    console.log(`Authenticating with header: '${header}'`)
    if (!header) return null

    /// for testing only
    let session
    session = await developmentAuthentication()
    if (session) {
      console.log(`dev auth: ${session.uID}`)
      return session
    }
    session = await regularAuthentication()
    console.log(`regular auth: ${session.uID}`)
    return session

    async function developmentAuthentication () {
      const parts = header.split('@')
      if (parts.length !== 2) return null
      if (parts[0] !== 'dev') return null
      const username = parts[1]
      try {
        const { uID } = await app.findUser({ username })
        return { uID }
      } catch (e) {
        if (e.name === 'UserNotFound') {
          console.log(`User '${username}' not found`)
          return null
        } else {
          console.error(e)
        }
        return null
      }
    }

    async function regularAuthentication () {
      try {
        const token = header
        const { uID } = await auth.verifyToken({ token })
        return { uID }
      } catch (e) {
        return null
      }
    }
  }


  function validateObject (obj, schema) {
    const result = {}

    for (const key of Object.keys(schema)) {
      const kind = schema[key]
      switch (kind) {
        case 'string':
          const v = validateString(obj[key], key)
          if (v.isError) return v
          result[key] = v.value
          break
        case 'number':
          const n = validateNumber(obj[key], key)
          if (n.isError) return n
          result[key] = n.value
          break
        default:
          throw new Error(`Unsupported type: ${kind}`)
      }
    }

    return result


    function validateString (value, name) {
      if (value === undefined) return fail(`${name} is required`)
      if (typeof value !== 'string') return fail(`${name} must be a string`)
      if (value.length === 0) return fail(`${name} must not be empty`)
      return { value }
    }


    function validateNumber (value, name) {
      if (value === undefined) return fail(`${name} is required`)
      const n = parseInt(value)
      if (isNaN(n)) return fail(`${name} must be a number`)
      return { value: n }
    }
  }


  function handleError (err) {
    switch (err.name) {
      case 'InvalidPassword':
        return fail(`Invalid password: ${err.message}`)
      case 'InvalidUsername':
        return fail(`Invalid username: ${err.message}`)
      case 'InvalidValue':
        return fail(`Invalid value: ${err.message}`)
      case 'UserExists':
        return ok({ json: { created: false, reason: 'user exists' } })
      case 'UserNotFound':
        return ok({ json: { token: null, reason: 'user not found' } })
      case 'IncorrectPassword':
        return ok({ json: { token: null, reason: 'incorrect password' } })
      default:
        throw err
    }
  }
}

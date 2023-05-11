module.exports = function mkAuth ({ sign, verify }) {
  return Object.freeze({
    createToken,
    verifyToken,
  })


  async function createToken ({ payload }) {
    function invalidPayload (message) {
      const e = new Error(message)
      e.name = 'TokenCreateError'
      throw e
    }

    if (payload === undefined) invalidPayload('payload is undefined')
    if (typeof payload !== 'object') invalidPayload('payload is not an object')

    try {
      const token = await sign({ payload})
      return { token }
    } catch (e_) {
      const e = new Error('failed to create token')
      e.cause = e_
      e.name = 'TokenCreateError'
      throw e
    }
  }


  async function verifyToken ({ token }) {
    function invalidToken (message) {
      const e = new Error(message)
      e.name = 'TokenVerifyError'
      throw e
    }

    if (token === undefined) invalidToken('token is undefined')
    if (typeof token !== 'string') invalidToken('token is not a string')

    try {
      return verify({ token })
    } catch (e_) {
      const e = new Error('failed to verify token')
      e.cause = e_
      e.name = 'TokenVerifyError'
      throw e
    }
  }
}

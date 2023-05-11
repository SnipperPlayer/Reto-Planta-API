function validatePassword ({ password }) {
  function fail (message) {
    const e = new Error(message)
    e.name = 'InvalidPassword'
    throw e
  }

  if (!password) fail('password is required')
  if (typeof password !== 'string') fail('password must be a string')
  if (password.length < 8) fail('password must be at least 8 characters long')
  if (password.length > 128) fail('password must be less than 128 characters long')
}

module.exports = {
  validatePassword,
}

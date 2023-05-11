function validatePasswordHash({ passwordHash }) {
  function fail (message) {
    const e = new Error(message)
    e.name = 'InvalidPasswordHash'
    throw e
  }

  if (!passwordHash) fail('Password hash is required')
  if (typeof passwordHash !== 'string') fail('Password hash must be a string')
  if (passwordHash.length < 60) fail('Password hash must be at least 60 characters long')
  if (passwordHash.length > 256) fail('Password hash must be at most 256 characters long')
}

module.exports = {
  validatePasswordHash,
}

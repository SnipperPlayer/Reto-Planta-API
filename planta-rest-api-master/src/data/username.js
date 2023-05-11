function validateUsername ({ username }) {
  function fail (msg) {
    const e = new Error(msg)
    e.name = 'InvalidUsername'
    throw e
  }

  if (!username) fail('InvalidUsername', 'username is required')
  if (typeof username !== 'string') fail('username must be a string')
  if (username.length < 3) fail('username must be at least 3 characters long')
  if (username.length > 30) fail('username must be at most 30 characters long')
  if (!/^[a-zA-Z0-9_\-]+$/.test(username)) fail('username must only contain alphanumeric characters, underscores, and dashes')
}

module.exports = {
  validateUsername,
}

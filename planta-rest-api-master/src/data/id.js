function validateId ({ id }) {
  function fail (message) {
    const e = new Error(message)
    e.name = 'InvalidId'
    throw e
  }

  if (id === undefined) fail('value is required')
  if (typeof id !== 'number') fail('value must be a number')
  if (id < 0) fail('value must be a positive number')
}

module.exports = {
  validateId,
}

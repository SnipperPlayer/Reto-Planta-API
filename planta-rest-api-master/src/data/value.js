function validateValue ({ value }) {
  function fail (message) {
    const e = new Error(message)
    e.name = 'InvalidValue'
    throw e
  }

  if (value === undefined) fail('value is required')
  if (typeof value !== 'number') fail('value must be a number')
}

module.exports = {
  validateValue,
}

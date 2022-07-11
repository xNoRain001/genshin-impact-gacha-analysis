const qs = require('qs')

const parseUrl = url => {
  const queryFlag = url.indexOf('?')
  const query = qs.parse(url.slice(queryFlag + 1))

  return {
    query
  }
}

module.exports = parseUrl
const qs = require('qs')

const textToQuery = text => {
  const urlStartIndex = text.indexOf('https://webstatic.mihoyo.com')
  const urlEndIndex = text.indexOf('#/log')
  const url = text.slice(urlStartIndex, urlEndIndex)
  const queryFlag = url.indexOf('?')
  const query = qs.parse(url.slice(queryFlag + 1))

  return query
}

module.exports = textToQuery
const qs = require('qs')

const textToParams = text => {
  const urlStartIndex = text.indexOf('https://webstatic.mihoyo.com')
  const urlEndIndex = text.indexOf('#/log')
  const url = text.slice(urlStartIndex, urlEndIndex)
  const queryFlag = url.indexOf('?')
  const params = qs.parse(url.slice(queryFlag + 1))

  return params
}

module.exports = textToParams
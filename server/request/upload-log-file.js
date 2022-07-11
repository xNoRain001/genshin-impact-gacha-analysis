const multiparty = require('multiparty')
const path = require('path')
const { readFile, parseQuery } = require('../utils/index')

const uploadLogFile = (req, res) => {
  const form = new multiparty.Form()

  form.uploadDir = `${ path.resolve() }/files`
  form.parse(req, async (err, fields, files) => {
    const path = files.file[0].path
    const text = await readFile(path)
    const start = text.indexOf('https://webstatic.mihoyo.com')
    const end = text.indexOf('#/log')
    const url = text.slice(start, end + 5)
    console.log(parseQuery(url))
    res.send({ foo: 'foo' })
  })
}

module.exports = uploadLogFile
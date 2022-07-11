const fs = require('fs')

const readFile = (path) => {
  return new Promise((resolve, reject) => {
    return fs.readFile(path, (err, buffer) => {
      if (err) {
        return reject(err)
      } else {
        return resolve(buffer.toString().replace(' ', ''))
      }
    })
  })
}

module.exports = readFile
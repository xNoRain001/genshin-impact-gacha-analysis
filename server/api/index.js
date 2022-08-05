const uploadLogFile = require('./upload-log-file')
const getAllGachaRecords = require('./get-all-gacha-records')

const initAPIs = app => {
  app.post('/upload-log-file', uploadLogFile)
  app.get('/get-all-gacha-records', getAllGachaRecords)
}

module.exports = initAPIs
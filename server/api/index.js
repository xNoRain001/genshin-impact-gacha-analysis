const uploadLogFile = require('./file/upload-log-file')
const getAllGachaRecords = require('./gacha-record/get-all-gacha-records')

const initAPIs = (app) => {
  app.post('/uploadLogFile', uploadLogFile)
  app.get('/getAllGachaRecords', getAllGachaRecords)
}

module.exports = initAPIs
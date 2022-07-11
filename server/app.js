const express = require('express')
const { wait } = require('./utils/index')
const { getPerPageGachaRecords, uploadLogFile } = require('./request/index')

const app = express()

app.post('/uploadLogFile', uploadLogFile)

app.get('/getAllGachaRecords', (() => {
  const allRecords = []

  return async (req, res) => {
    try {
      const prePageRecords = await getPerPageGachaRecords()
      let endId = prePageRecords[prePageRecords.length - 1].id
      allRecords.push(...prePageRecords)
    
      // if end_id exists, get next page records.
      while (endId) {
        await wait(500) // wait some time, avoid visit too frequently.
        const prePageRecords = await getPerPageGachaRecords(endId)
        allRecords.push(...prePageRecords)

        // if the number of records is less than 6, it means that all records 
        // have been fetched.
        if (prePageRecords.length < 6) {
          break
        }
        
        // update end_id
        endId = prePageRecords[prePageRecords.length - 1].id
      }
        
      res.send(allRecords)
    } catch (error) {
      res.send({ error: error.message })
    }
  }
})())

app.listen(3000, err => {
  if (!err) {
    console.log('http://127.0.0.1:3000')
  }
})
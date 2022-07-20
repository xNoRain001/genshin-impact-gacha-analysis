const getPerPageGachaRecords = require('../../request/get-per-page-gacha-records')
const { wait } = require('../../utils/index')

const getAllGachaRecords = async (req, res) => {
  let allRecords = []
  const { query: parmas } = req

  try {
    const prePageRecords = await getPerPageGachaRecords(parmas)

    if (prePageRecords.length >= 6) {
      let endId = prePageRecords[prePageRecords.length - 1].id
      allRecords.push(...prePageRecords)

      // if end_id exists, get next page records.
      while (endId) {
        parmas.page++
        parmas.end_id = endId
        await wait(200) // wait some time, avoid visit too frequently.
        const prePageRecords = await getPerPageGachaRecords(parmas)
        allRecords.push(...prePageRecords)

        // if the number of records is less than 6, it means that all records 
        // have been fetched.
        if (prePageRecords.length < 6) {
          break
        }
        
        // update end_id
        endId = prePageRecords[prePageRecords.length - 1].id
      }
    } else {
      allRecords.push(...prePageRecords)
    }
    
    res.send({
      status: 200,
      statusText: 'OK',
      data: allRecords
    })
    allRecords = []
  } catch (error) {
    res.send({ 
      status: 500,
      message: error.message 
    })
  }
}

module.exports = getAllGachaRecords
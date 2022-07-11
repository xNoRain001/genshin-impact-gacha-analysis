const { wait } = require('../../utils/index')
const getPerPageGachaRecords = require('../../request/get-per-page-gacha-records')

const getAllGachaRecords = async (req, res) => {
  let allRecords = []
  const { query } = req

  try {
    const prePageRecords = await getPerPageGachaRecords(query)
    let endId = prePageRecords[prePageRecords.length - 1].id
    allRecords.push(...prePageRecords)
  
    // if end_id exists, get next page records.
    while (endId && query.page < 2) {
      query.page++
      query.end_id = endId
      await wait(500) // wait some time, avoid visit too frequently.
      const prePageRecords = await getPerPageGachaRecords(query)
      allRecords.push(...prePageRecords)

      // if the number of records is less than 6, it means that all records 
      // have been fetched.
      if (prePageRecords.length < 6) {
        break
      }
      
      // update end_id
      endId = prePageRecords[prePageRecords.length - 1].id
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
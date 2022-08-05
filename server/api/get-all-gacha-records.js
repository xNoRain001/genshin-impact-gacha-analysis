const getPerPageGachaRecords = require('../request/get-per-page-gacha-records')
const { wait } = require('../utils/index')

const getAllGachaRecords = async (req, res) => {
  let allRecords = []
  const { query: params } = req

  try {
    const prePageRecords = await getPerPageGachaRecords(params)

    // 可能不止一页
    if (prePageRecords.length === 6) {
      let endId = prePageRecords[prePageRecords.length - 1].id
      allRecords.push(...prePageRecords)

      // 如果有 endId，获取下一页数据。
      while (endId) {
        params.end_id = endId
        // 等待 200 ms，防止请求太频繁。
        await wait(200)
        const prePageRecords = await getPerPageGachaRecords(params)
        allRecords.push(...prePageRecords)

        // 如果这一页数据量少于 6个，说明所有数据都获取完了。
        if (prePageRecords.length < 6) {
          break
        }
        
        // 否则更新 endId 进行下一轮循环。
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
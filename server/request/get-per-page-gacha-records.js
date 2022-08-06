const qs = require('qs')
const axios = require('axios')
const { baseUrl } = require('../shared')

const getPerPageGachaRecords = params => {
  return new Promise(async (resolve, reject) => {
    try {
      const url = `${ baseUrl }?${ qs.stringify(params) }`
      
      const { data: { data } }  = await axios.get(url)

      if (data) {
        // 如果 endId 是最后一项，返回的 list 是 []
        resolve(data.list)
      } else {
        // 如果文件过期，list 为 null
        throw new Error('output_log.txt 文件过期')
      }
    } catch (error) {
      reject(error)
    }
  })
}

module.exports = getPerPageGachaRecords
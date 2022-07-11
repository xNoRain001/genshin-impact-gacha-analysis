const axios = require('axios')
const qs = require('qs')

const getPerPageGachaRecords = params => {
  return new Promise(async (resolve, reject) => {
    try {
      const url = `https://hk4e-api.mihoyo.com/event/gacha_info/api/getGachaLog?${ qs.stringify(params) }`
      const { data: { data: { list } } }  = await axios.get(url)
      return resolve(list)
    } catch (error) {
      return reject(error)
    }
  })
}

module.exports = getPerPageGachaRecords
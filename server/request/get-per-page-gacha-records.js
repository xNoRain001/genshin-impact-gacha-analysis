const axios = require('axios')
const qs = require('qs')

const getPerPageGachaRecords = query => {
  return new Promise(async (resolve, reject) => {
    try {
      const { data: { data: { list } } }  = await axios.get(`https://hk4e-api.mihoyo.com/event/gacha_info/api/getGachaLog?${ qs.stringify(query) }`)
      return resolve(list)
    } catch (error) {
      return reject(error)
    }
  })
}

module.exports = getPerPageGachaRecords
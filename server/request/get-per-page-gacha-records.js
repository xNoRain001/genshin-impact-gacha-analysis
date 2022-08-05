const qs = require('qs')
const axios = require('axios')
const { baseUrl } = require('../shared')

const getPerPageGachaRecords = params => {
  return new Promise(async (resolve, reject) => {
    try {
      const url = `${ baseUrl }?${ qs.stringify(params) }`
      const { data: { data: { list } } }  = await axios.get(url)
      resolve(list)
    } catch (error) {
      reject(error)
    }
  })
}

module.exports = getPerPageGachaRecords
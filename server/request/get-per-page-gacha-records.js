const axios = require('axios')

const getPerPageGachaRecords = async () => {
  try {
    const { data: { data: { list } } }  = await axios.get(``)
    return Promise.resolve(list)
  } catch (error) {
    return Promise.reject(error)
  }
}

module.exports = getPerPageGachaRecords
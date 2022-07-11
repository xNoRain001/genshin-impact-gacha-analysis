const multiparty = require('multiparty')
const path = require('path')
const { readFile, textToQuery } = require('../../utils/index')

const uploadLogFile = (req, res) => {
  const url = {
    baseUrl: 'https://hk4e-api.mihoyo.com/event/gacha_info/api/getGachaLog',
    query: {
      authkey_ver: '',
      sign_type: '',
      auth_appid: '',
      init_type: '',
      gacha_id: '',
      timestamp: '',
      lang: '',
      device_type: '',
      ext: '',
      plat_type: '', 
      authkey: '',
      game_biz: '',
      gacha_type: 301, // 301：UP，302: 武器，200：常驻
      page: 1,
      size: 6,
      end_id: 0
    }
  }
  const form = new multiparty.Form()

  form.uploadDir = `${ path.resolve() }/files`
  form.parse(req, async (err, fields, files) => {
    const path = files.file[0].path
    const text = await readFile(path)
    const query = textToQuery(text)
    const keys = Object.keys(query)

    for (let i = 0, key; key = keys[i++];) {
      if (query[key] === '') {
        res.send({
          status: 400,
          statusText: 'Bad Request',
          message: '请选择 output_log.txt'
        })

        return
      }
      url.query[key] = query[key]
    }

    res.send({ 
      status: 200,
      statusText: 'OK',
      message: '正在进行抽卡分析',
      data: url.query
    })
  })
}

module.exports = uploadLogFile
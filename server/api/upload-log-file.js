const path = require('path')
const multiparty = require('multiparty')
const { readFile, textToParams } = require('../utils/index')

const uploadLogFile = (req, res) => {

  // 获取抽卡记录必须的参数
  const params = {
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
    gacha_type: 301,
    page: 1,
    size: 6,
    end_id: 0 // 通过传入这一页最后一项的 end_id 才能获取到下一页的数据
  }
  const form = new multiparty.Form()

  form.uploadDir = `${ path.resolve() }/files`
  form.parse(req, async (err, _, files) => {
    if (err) {
      res.send({ 
        status: 400,
        statusText: 'Bad Request',
        message: 'output_log.txt 文件错误'
      })

      return
    }

    // 获取文件内容
    const text = await readFile(files.file[0].path)
    // 获取所需参数
    const filteredParams = textToParams(text)
    const keys = Object.keys(params)

    for (let i = 0, key; key = keys[i++];) {
      // 替换参数
      params[key] = filteredParams[key] || params[key]
    }

    for (let i = 0, key; key = keys[i++];) {
      // 某个参数提取不到
      if (params[key] === '') {
        res.send({
          status: 400,
          statusText: 'Bad Request',
          message: 'output_log.txt 文件错误'
        })

        return
      }
    }

    res.send({ 
      status: 200,
      statusText: 'OK',
      message: '获取参数成功',
      data: params
    })
  })
}

module.exports = uploadLogFile
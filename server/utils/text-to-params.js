const qs = require('qs')

// 从文件中找出获取抽卡记录需要的参数
const textToParams = text => {
  console.log('@')
  const flag = 'OnGetWebViewPageFinish:'
  const startIndex = text.indexOf(`${ flag }https://webstatic.mihoyo.com/hk4e/event/e20190909gacha/index.html`)
  const endIndex = startIndex + text.slice(startIndex).indexOf('#/log')
  const url = text.slice(startIndex, endIndex)
  // ? 的索引
  const questionMarkIdx = url.indexOf('?')
  const params = url.slice(questionMarkIdx + 1)
  
  return qs.parse(params)
}

module.exports = textToParams
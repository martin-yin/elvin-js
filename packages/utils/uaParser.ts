import { SDK_VERSION } from '../shared/config'
import { UAParser } from 'ua-parser-js'

export const getUaResult = () => {
  const uaResult = new UAParser().getResult()

  return {
    browser_version: uaResult.browser.version,
    browser: uaResult.browser.name,
    os_version: uaResult.os.version,
    os: uaResult.os.name,
    ua: uaResult.ua,
    device: uaResult.device.model ? uaResult.device.model : 'Unknow',
    device_type: uaResult.device.type ? uaResult.device.type : 'Pc'
  }
}

export const getCommon = () => {
  const u = (navigator as any).connection
  return {
    language: getLang(),
    screen: screen.width + 'x' + screen.height,
    vp: getScreen(),
    connection_type: u ? u.effectiveType : '',
    sdk_version: SDK_VERSION,
    environment: '',
    ...getUaResult()
  }
}

export const getScreen = () => {
  const w = document.documentElement.clientWidth || document.body.clientWidth
  const h = document.documentElement.clientHeight || document.body.clientHeight
  return w + 'x' + h
}

export const getLang = () => {
  let lang = navigator.language || (navigator as any).userLanguage //常规浏览器语言和IE浏览器
  lang = lang.substr(0, 2) //截取lang前2位字符
  return lang
}

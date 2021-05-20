import { UAParser } from 'ua-parser-js'

export const getUaResult = () => {
  const uaResult = new UAParser().getResult()

  return {
    browser_version: uaResult.browser_version,
    browser: uaResult.browser,
    os_version: uaResult.os_version,
    os: uaResult.os,
    ua: uaResult.ua,
    device: uaResult.device.model ? uaResult.device.model : 'Unknow',
    device_type: uaResult.device.type ? uaResult.device.type : 'Pc'
  }
}

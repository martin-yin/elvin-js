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

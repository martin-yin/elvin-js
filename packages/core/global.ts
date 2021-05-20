import { EVENTTYPES } from '../shared/constant'
import { variableTypeDetection } from '../utils/is'
import { Options } from './options'
import { TransportData } from './transportData'

export interface ReportSupport {
  transportData: TransportData
  replaceFlag: { [key in EVENTTYPES]?: boolean }
  options?: Options
}

interface ReportGlobal {
  __REPORT__?: ReportSupport
}

export const isNodeEnv = variableTypeDetection.isProcess(typeof process !== 'undefined' ? process : 0)

export const isBrowserEnv = variableTypeDetection.isWindow(typeof window !== 'undefined' ? window : 0)

export function getGlobal<T>() {
  if (isBrowserEnv) return window as unknown as ReportGlobal & T
  if (isNodeEnv) return process as unknown as ReportGlobal & T
}

const _global = getGlobal<Window>()
const _support = getGlobalReportSupport()

export function getGlobalReportSupport(): ReportSupport {
  _global.__REPORT__ = _global.__REPORT__ || ({} as ReportSupport)
  return _global.__REPORT__
}

export { _global, _support }

_support.replaceFlag = _support.replaceFlag || {}
const replaceFlag = _support.replaceFlag

export function setFlag(replaceType: EVENTTYPES, isSet: boolean): void {
  if (replaceFlag[replaceType]) return
  replaceFlag[replaceType] = isSet
}

export function getFlag(replaceType: EVENTTYPES): boolean {
  return replaceFlag[replaceType] ? true : false
}

export function supportsHistory(): boolean {
  // NOTE: in Chrome App environment, touching history.pushState, *even inside
  //       a try/catch block*, will cause Chrome to output an error to console.error
  // borrowed from: https://github.com/angular/angular.js/pull/13945/files
  const chrome = (_global as any).chrome
  // tslint:disable-next-line:no-unsafe-any
  const isChromePackagedApp = chrome && chrome.app && chrome.app.runtime
  const hasHistoryApi = 'history' in _global && !!_global.history.pushState && !!_global.history.replaceState

  return !isChromePackagedApp && hasHistoryApi
}

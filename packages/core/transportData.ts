import { SERVER_URL } from '../shared'
import { Queue } from '../utils/queue'
import { getCommon } from '../utils/uaParser'
import { EMethods, InitOptions } from '../types/options'
import { isBrowserEnv, _support } from './global'
import { getLocationHref, getYMDHMS, getUid, getSid } from '../utils/helpers'
import { ActionTypeKeys, ErrorReport, HistryReport, HttpReport, PerformanceReport, ResourceErrorReport } from 'packages/types/common'

export class TransportData {
  queue: Queue
  monitorId: string
  userId: string
  sessionId: string
  reportUrl: string
  constructor() {
    this.queue = new Queue()
  }

  bindOptions(options: InitOptions): void {
    const { monitorId, reportUrl, userId, sessionId } = options
    this.monitorId = monitorId
    this.reportUrl = reportUrl ? reportUrl : SERVER_URL
    this.userId = userId ? userId : getUid()
    this.sessionId = sessionId ? sessionId : getSid()
  }

  async xhrPost(data) {
    data = this.getTransportData(data)
    const requestFun = (): void => {
      const xhr = new XMLHttpRequest()
      xhr.open(
        EMethods.Post,
        `${this.reportUrl}?action_type=${data.action_type}&monitor_id=${data.monitor_id}&session_id=${this.getSessionId()}`
      )
      xhr.setRequestHeader('Content-Type', 'application/json')
      xhr.withCredentials = true
      xhr.send(JSON.stringify(data))
    }
    this.queue.addFn(requestFun)
  }

  getMonitorId() {
    return this.monitorId
  }

  getUserId() {
    return this.userId
  }

  getSessionId() {
    return this.sessionId
  }

  getTransportData(data: HttpReport | ResourceErrorReport | ErrorReport | HistryReport) {
    return {
      ...data,
      ...getCommon(),
      user_id: this.getUserId(),
      monitor_id: this.getMonitorId(),
      session_id: this.getSessionId(),
      page_url: getLocationHref(),
      happen_day: getYMDHMS()
    }
  }
  isSdkTransportUrl(targetUrl: string): boolean {
    return targetUrl.indexOf(this.reportUrl) !== -1
  }

  send(data: HttpReport | ResourceErrorReport | ErrorReport | HistryReport | PerformanceReport) {
    if (isBrowserEnv && ActionTypeKeys.includes(data.action_type)) {
      return this.xhrPost(data)
    }
  }
}
const transportData = _support.transportData || (_support.transportData = new TransportData())
export { transportData }

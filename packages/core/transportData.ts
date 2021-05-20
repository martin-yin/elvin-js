import { SERVER_URL } from '../shared'
import { Queue } from '../utils/queue'
import { getUaResult } from '../utils/uaParser'
import { EMethods, InitOptions } from '../types/options'
import { isBrowserEnv, _support } from './global'

export class TransportData {
  queue: Queue
  monitorId = ''
  userId = ''
  eventId = ''
  constructor(public url: string) {
    this.queue = new Queue()
  }

  bindOptions(options: InitOptions): void {
    const { monitorId } = options
    this.monitorId = monitorId
  }

  async xhrPost(data) {
    data = this.getTransportData(data)
    const requestFun = (): void => {
      const xhr = new XMLHttpRequest()
      xhr.open(EMethods.Post, `${this.url}`)
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

  getEventId() {
    return this.eventId
  }

  getActionMethod(data) {
    let action = ''
    if (data.action_type == 'PAGE_LOAD') {
      action = 'performance'
    } else if (data.action_type == 'RESOURCE_ERROR') {
      action = 'resource'
    } else if (data.action_type == 'OPERATION') {
      action = 'operation'
    } else if (data.action_type == 'JS_ERROR') {
      action = 'issues'
    } else if (data.action_type == 'HTTP_LOG') {
      action = 'http'
    } else if (data.action_type == 'PAGE_VIEW') {
      action = 'view'
    }
    return action
  }

  getTransportData(data) {
    const action = this.getActionMethod(data)
    const uaParser = getUaResult()
    return {
      ...data,
      user_id: this.getUserId(),
      monitor_id: this.getMonitorId(),
      event_id: this.getEventId(),
      action,
      ...uaParser
    }
  }
  isSdkTransportUrl(targetUrl: string): boolean {
    return targetUrl.indexOf(this.url) !== -1
  }

  send(data) {
    if (isBrowserEnv) {
      return this.xhrPost(data)
    }
  }
}
const transportData = _support.transportData || (_support.transportData = new TransportData(SERVER_URL))
export { transportData }

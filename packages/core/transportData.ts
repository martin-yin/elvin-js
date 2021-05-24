import { SERVER_URL } from '../shared'
import { Queue } from '../utils/queue'
import { getUaResult } from '../utils/uaParser'
import { EMethods, InitOptions } from '../types/options'
import { isBrowserEnv, _support } from './global'

export class TransportData {
  queue: Queue
  monitorId: string;
  userId: string;
  eventId: string;
  constructor(public url: string) {
    this.queue = new Queue()
  }

  bindOptions(options: InitOptions): void {
    const { monitorId, userId, eventId } = options
    this.monitorId = monitorId
    this.userId = userId;
    this.eventId = eventId;
  }

  async xhrPost(data) {
    data = this.getTransportData(data)
    const requestFun = (): void => {
      const xhr = new XMLHttpRequest()
      xhr.open(EMethods.Post, `${this.url}?action_type=${data.action_type}&monitor_id=${data.monitor_id}`)
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


  getTransportData(data) {
    const uaParser = getUaResult()

    return {
      ...data,
      user_id: this.getUserId(),
      monitor_id: this.getMonitorId(),
      event_id: this.getEventId(),
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

import { EVENTTYPES } from '../shared'
import { nativeTryCatch } from '../utils/exception'
import { getFunctionName } from '../utils/helpers'
import { getFlag, setFlag } from './global'

export interface ReplaceHandler {
  type: EVENTTYPES | any
  callback: ReplaceCallback
}

type ReplaceCallback = (data: any) => void

const handlers: { [key in EVENTTYPES]?: ReplaceCallback[] } = {}

export function subscribeEvent(handler: ReplaceHandler): boolean {
  if (!handler || getFlag(handler.type)) return false
  setFlag(handler.type, true)
  handlers[handler.type] = handlers[handler.type] || []
  handlers[handler.type].push(handler.callback)
  return true
}

export function triggerHandlers(type: EVENTTYPES, data: any): void {
  if (!type || !handlers[type]) return
  handlers[type].forEach((callback) => {
    nativeTryCatch(
      () => {
        callback(data)
      },
      (e: Error) => {
        console.error(`重写事件triggerHandlers的回调函数发生错误\nType:${type}\nName: ${getFunctionName(callback)}\nError: ${e}`)
      }
    )
  })
}

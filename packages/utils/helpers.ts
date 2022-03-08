import { HTTP_CODE } from '../shared'
import { IAnyObject } from '../types/common'
import { nativeToString } from './is'
import ErrorStackParser from 'error-stack-parser'

export const defaultFunctionName = '<anonymous>'

export function getLocationHref(): string {
  if (typeof document === 'undefined' || document.location == null) return ''
  return document.location.href
}

// 用到所有事件名称
type TotalEventName = keyof GlobalEventHandlersEventMap | keyof XMLHttpRequestEventTargetEventMap | keyof WindowEventMap

/**
 * 添加事件监听器
 *
 * ../export
 * ../param {{ addEventListener: Function }} target
 * ../param {keyof TotalEventName} eventName
 * ../param {Function} handler
 * ../param {(boolean | Object)} opitons
 * ../returns
 */
export function on(
  target: { addEventListener: Function },
  eventName: TotalEventName,
  handler: Function,
  opitons: boolean | unknown = false
): void {
  target.addEventListener(eventName, handler, opitons)
}

/**
 *
 * 重写对象上面的某个属性
 * ../param source 需要被重写的对象
 * ../param name 需要被重写对象的key
 * ../param replacement 以原有的函数作为参数，执行并重写原有函数
 * ../returns void
 */
export function replaceOld(source: IAnyObject, name: string, replacement: (...args: any[]) => any, isForced = false): void {
  if (name in source || isForced) {
    const original = source[name]
    const wrapped = replacement(original)
    if (typeof wrapped === 'function') {
      source[name] = wrapped
    }
  }
}

/**
 * 用&分割对象，返回a=1&b=2
 * ../param obj 需要拼接的对象
 */
// export function splitObjToQuery(obj: Record<string, unknown>): string {
//   return Object.entries(obj).reduce((result, [key, value], index) => {
//     if (index !== 0) {
//       result += '&'
//     }
//     result += `${key}=${value}`
//     return result
//   }, '')
// }

export function each(data, fn) {
  let n = 0
  const r = data.length
  if (isTypeOf(data, 'Array')) for (; n < r && !1 !== fn.call(data[n], data[n], n); n++);
  else for (const m in data) if (!1 === fn.call(data[m], data[m], m)) break
  return data
}

export function isTypeOf(data, type = null) {
  const n = Object.prototype.toString.call(data).substring(8).replace(']', '')
  return type ? n === type : n
}

/**
 * 需要获取函数名，匿名则返回<anonymous>
 * ../param {unknown} fn 需要获取函数名的函数本体
 * ../returns 返回传入的函数的函数名
 */
export function getFunctionName(fn: unknown): string {
  if (!fn || typeof fn !== 'function') {
    return defaultFunctionName
  }
  return fn.name || defaultFunctionName
}

/**
 * 获取当前的时间戳
 * ../returns 返回当前时间戳
 */
export function getTimestamp(): number {
  return Date.now()
}

export function typeofAny(target: any, type: string): boolean {
  return typeof target === type
}

export function toStringAny(target: any, type: string): boolean {
  return nativeToString.call(target) === type
}

export function validateOption(target: any, targetName: string, expectType: string): boolean {
  if (typeofAny(target, expectType)) return true
  typeof target !== 'undefined' && console.error(`${targetName}期望传入${expectType}类型，目前是${typeof target}类型`)
  return false
}

export function toStringValidateOption(target: any, targetName: string, expectType: string): boolean {
  if (toStringAny(target, expectType)) return true
  typeof target !== 'undefined' && console.error(`${targetName}期望传入${expectType}类型，目前是${nativeToString.call(target)}类型`)
  return false
}

export function getYMDHMS() {
  const datetime = new Date()
  const year = datetime.getFullYear(),
    month = ('0' + (datetime.getMonth() + 1)).slice(-2),
    date = ('0' + datetime.getDate()).slice(-2)
  return `${year}-${month}-${date}`
}

export function getUid(): string {
  let uid = localStorage.getItem('elvin_user_id') || ''
  if (!uid) {
    uid = generateUUID()
    localStorage.setItem('elvin_user_id', uid)
  }
  return uid
}

export function getSid() {
  let sid = sessionStorage.getItem('elvin_session_id') || ''
  if (!sid) {
    sid = generateUUID()
    sessionStorage.setItem('elvin_session_id', sid)
  }
  return sid
}

export function generateUUID(): string {
  let d = new Date().getTime()
  const uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (d + Math.random() * 16) % 16 | 0
    d = Math.floor(d / 16)
    return (c == 'x' ? r : (r & 0x3) | 0x8).toString(16)
  })
  return uuid
}

export function getBigVersion(version: string) {
  return Number(version.split('.')[0])
}

export function isHttpFail(code: number) {
  return code === 0 || code === HTTP_CODE.BAD_REQUEST || code > HTTP_CODE.UNAUTHORIZED
}

/**
 * 解析字符串错误信息，返回message、name、stacks
 * @param error error string
 */
export function parseErrorString(error: Error): StackFrame[] {
  return ErrorStackParser.parse(error)
}

// 回头优化！！！！
export const getElmPath = function (e) {
  if (!e || 1 !== e.nodeType) return ''
  let ret = [],
    deepLength = 0, // 层数，最多5层
    elm = '' // 元素
  ret.push(`(${e.innerText.substr(0, 50)})`)
  for (let target = e || null; target && deepLength++ < 5 && !('html' === (elm = normalTarget(target))); ) {
    ret.push(elm)
    target = target.parentNode
  }
  return ret.reverse().join(' > ')
}

const normalTarget = function (e) {
  let t,
    n,
    r,
    a,
    i,
    o = []
  if (!e || !e.tagName) return ''
  if (
    (o.push(e.tagName.toLowerCase()),
    e.id && o.push('#'.concat(e.id)),
    (t = e.className) && '[object String]' === Object.prototype.toString.call(t))
  ) {
    for (n = t.split(/\s+/), i = 0; i < n.length; i++) {
      if (n[i].indexOf('active') < 0) {
        o.push('.'.concat(n[i]))
      }
    }
  }
  const s = ['type', 'name', 'title', 'alt']
  for (i = 0; i < s.length; i++) (r = s[i]), (a = e.getAttribute(r)) && o.push('['.concat(r, '="').concat(a, '"]'))
  return o.join('')
}

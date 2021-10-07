import { HTTP_CODE } from '../shared'
import { IAnyObject } from '../types/common'
import { nativeToString, variableTypeDetection } from './is'
import ErrorStackParser, { StackFrame } from 'error-stack-parser'

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

export const defaultFunctionName = '<anonymous>'
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

// 函数防抖
/**
 *
 * ../param fn 需要防抖的函数
 * ../param delay 防抖的时间间隔
 * ../param isImmediate 是否需要立即执行，默认为false，第一次是不执行的
 * ../returns 返回一个包含防抖功能的函数
 */
// export const debounce = (fn: voidFun, delay: number, isImmediate = false): voidFun => {
//   let timer = null
//   return function (...args: any) {
//     if (isImmediate) {
//       fn.apply(this, args)
//       isImmediate = false
//       return
//     }
//     clearTimeout(timer)
//     timer = setTimeout(() => {
//       fn.apply(this, args)
//     }, delay)
//   }
// }

// 函数节流
/**
 *
 * ../param fn 需要节流的函数
 * ../param delay 节流的时间间隔
 * ../returns 返回一个包含节流功能的函数
 */
export const throttle = (fn: Function, delay: number): Function => {
  let canRun = true
  return function (...args: any) {
    if (!canRun) return
    fn.apply(this, args)
    canRun = false
    setTimeout(() => {
      canRun = true
    }, delay)
  }
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
  // typeof target !== "undefined" &&
  //     logger.error(
  //         `${targetName}期望传入${expectType}类型，目前是${typeof target}类型`
  //     );
  return false
}

export function toStringValidateOption(target: any, targetName: string, expectType: string): boolean {
  if (toStringAny(target, expectType)) return true
  // typeof target !== "undefined" &&
  // logger.error(
  //     `${targetName}期望传入${expectType}类型，目前是${nativeToString.call(
  //         target
  //     )}类型`
  // );
  return false
}

export function getYMDHMS() {
  const datetime = new Date()
  const year = datetime.getFullYear(),
    month = ('0' + (datetime.getMonth() + 1)).slice(-2),
    date = ('0' + datetime.getDate()).slice(-2)
  return `${year}-${month}-${date}`
}

export function slientConsoleScope(callback: Function) {
  //   globalVar.isLogAddBreadcrumb = false;
  //   callback();
  //   globalVar.isLogAddBreadcrumb = true;
}

// export function generateUUID(): string {
//   let d = new Date().getTime()
//   const uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
//     const r = (d + Math.random() * 16) % 16 | 0
//     d = Math.floor(d / 16)
//     return (c == 'x' ? r : (r & 0x3) | 0x8).toString(16)
//   })
//   return uuid
// }

export function getUserIdInCookie(fallbackId) {
  var id = fallbackId;
  try {
    id = getValueFromCookieName(document.cookie, "RANGERS_WEB_ID");
    if (id == '') {
      const expire = new Date((new Date()).getTime() + 24 * 3600000);
      document.cookie = `RANGERS_WEB_ID=${fallbackId};expires=${expire}`
    }
  }
  catch (_e) {
    // do nothing
  }
  return id || fallbackId;
};

export function getValueFromCookieName(cookie, name) {
  var e_1, _a;
  if (!cookie || !name) {
    return '';
  }
  var list = cookie.split(';');
  var cookieObj = {};
  try {
    for (var list_1 = __values(list), list_1_1 = list_1.next(); !list_1_1.done; list_1_1 = list_1.next()) {
      var item = list_1_1.value;
      var pair = item.split('=');
      var cookieKey = isString(pair[0]) && pair[0].trim();
      if (cookieKey && isString(pair[1])) {
        cookieObj[cookieKey] = pair[1].trim();
      }
    }
  }
  catch (e_1_1) { e_1 = { error: e_1_1 }; }
  finally {
    try {
      if (list_1_1 && !list_1_1.done && (_a = list_1.return)) _a.call(list_1);
    }
    finally { if (e_1) throw e_1.error; }
  }
  return cookieObj[name] || '';
}

function isString(what) {
  return Object.prototype.toString.call(what) === '[object String]';
}

function __values(o) {
  var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
  if (m) return m.call(o);
  if (o && typeof o.length === "number") return {
    next: function () {
      if (o && i >= o.length) o = void 0;
      return { value: o && o[i++], done: !o };
    }
  };
  throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
}

export function mathRNG() {
  var rnds = new Array(16);
  var r = 0;
  for (var i = 0; i < 16; i++) {
    if ((i & 0x03) === 0) {
      r = Math.random() * 0x100000000;
    }
    rnds[i] = (r >>> ((i & 0x03) << 3)) & 0xff;
  }
  return rnds;
}

function bytesToUuid(buf) {
  var byteToHex = [];
  for (var index = 0; index < 256; ++index) {
    byteToHex[index] = (index + 0x100).toString(16).substr(1);
  }
  var i = 0;
  var bth = byteToHex;
  // join used to fix memory issue caused by concatenation: https://bugs.chromium.org/p/v8/issues/detail?id=3175#c4
  return [
    bth[buf[i++]],
    bth[buf[i++]],
    bth[buf[i++]],
    bth[buf[i++]],
    '-',
    bth[buf[i++]],
    bth[buf[i++]],
    '-',
    bth[buf[i++]],
    bth[buf[i++]],
    '-',
    bth[buf[i++]],
    bth[buf[i++]],
    '-',
    bth[buf[i++]],
    bth[buf[i++]],
    bth[buf[i++]],
    bth[buf[i++]],
    bth[buf[i++]],
    bth[buf[i++]],
  ].join('');
}
export function uuid() {
  var rnds = mathRNG();
  // Per 4.4, set bits for version and `clock_seq_hi_and_reserved`
  rnds[6] = (rnds[6] & 0x0f) | 0x40;
  rnds[8] = (rnds[8] & 0x3f) | 0x80;
  return bytesToUuid(rnds);
}

export function unknownToString(target: unknown): string {
  if (variableTypeDetection.isString(target)) {
    return target as string
  }
  if (variableTypeDetection.isUndefined(target)) {
    return 'undefined'
  }
  return JSON.stringify(target)
}

export function getBigVersion(version: string) {
  return Number(version.split('.')[0])
}

export function isHttpFail(code: number) {
  return code === 0 || code === HTTP_CODE.BAD_REQUEST || code > HTTP_CODE.UNAUTHORIZED
}

/**
 * 给url添加query
 * @param url
 * @param query
 */
export function setUrlQuery(url: string, query: object) {
  const queryArr = []
  Object.keys(query).forEach((k) => {
    queryArr.push(`${k}=${query[k]}`)
  })
  if (url.indexOf('?') !== -1) {
    url = `${url}&${queryArr.join('&')}`
  } else {
    url = `${url}?${queryArr.join('&')}`
  }
  return url
}

/**
 * 解析字符串错误信息，返回message、name、stacks
 * @param str error string
 */
export function parseErrorString(error: Error): StackFrame[] {
  return ErrorStackParser.parse(error)
}

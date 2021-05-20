import { supportsHistory, _global } from '../core/global'
import { options, setTraceId } from '../core/options'
import { ReplaceHandler, subscribeEvent, triggerHandlers } from '../core/subscribe'
import { transportData } from '../core/transportData'
import { EVENTTYPES, HTTPTYPE, voidFun } from '../shared'
import { REPORTXMLHttpRequest } from '../types/common'
import { EMethods } from '../types/options'

import { getLocationHref, getTimestamp, getYMDHMS, on, replaceOld } from '../utils/helpers'
import { isExistProperty, variableTypeDetection } from '../utils/is'

function isFilterHttpUrl(url: string) {
  return options.filterXhrUrlRegExp && options.filterXhrUrlRegExp.test(url)
}

function replace(type: EVENTTYPES) {
  switch (type) {
    case EVENTTYPES.XHR:
      xhrReplace()
      break
    // case EVENTTYPES.FETCH:
    //   fetchReplace();
    //   break;
    case EVENTTYPES.ERROR:
      listenError()
      break
    // case EVENTTYPES.CONSOLE:
    //   consoleReplace();
    //   break;
    case EVENTTYPES.HISTORY:
      historyReplace()
      break
    case EVENTTYPES.UNHANDLEDREJECTION:
      unhandledrejectionReplace()
      break
    case EVENTTYPES.DOM:
      domReplace()
      break
    case EVENTTYPES.HASHCHANGE:
      listenHashchange()
      break
    case EVENTTYPES.PERFORMANCE:
      PerformanceReplace()
      break
    default:
      break
  }
}

export function addReplaceHandler(handler: ReplaceHandler) {
  if (!subscribeEvent(handler)) return
  replace(handler.type as EVENTTYPES)
}

function xhrReplace(): void {
  if (!('XMLHttpRequest' in _global)) {
    return
  }
  const originalXhrProto = XMLHttpRequest.prototype
  replaceOld(originalXhrProto, 'open', (originalOpen: voidFun): voidFun => {
    return function (this: REPORTXMLHttpRequest, ...args: any[]): void {
      const method = variableTypeDetection.isString(args[0]) ? args[0].toUpperCase() : args[0]

      this.report_xhr = {
        method,
        url: args[1],
        type: HTTPTYPE.XHR,
        load_time: 0,
        http_url: args[1],
        status: 0,
        status_text: '',
        happen_day: getYMDHMS(),
        start_time: getTimestamp(),
        action_type: 'HTTP_LOG',
        page_url: getLocationHref(),
        response_text: '',
        request_text: '',
        req_data: ''
      }
      originalOpen.apply(this, args)
    }
  })
  replaceOld(originalXhrProto, 'send', (originalSend: voidFun): voidFun => {
    return function (this: REPORTXMLHttpRequest, ...args: any[]): void {
      const { method, url } = this.report_xhr
      setTraceId(url, (headerFieldName: string, traceId: string) => {
        this.report_xhr.traceId = traceId
        this.setRequestHeader(headerFieldName, traceId)
      })
      options.beforeAppAjaxSend && options.beforeAppAjaxSend({ method, url }, this)
      on(this, 'loadend', function (this: REPORTXMLHttpRequest) {
        if ((method === EMethods.Post && transportData.isSdkTransportUrl(url)) || isFilterHttpUrl(url))
          // 这里仅用于开发测试
          return

        const { responseType, response, status, statusText } = this
        this.report_xhr.request_text = args[0]
        const eTime = getTimestamp()
        this.report_xhr.status = status
        if (['', 'json', 'text'].indexOf(responseType) !== -1) {
          this.report_xhr.response_text = typeof response === 'object' ? JSON.stringify(response) : response
        }
        this.report_xhr.status_text = statusText
        this.report_xhr.happen_time = getTimestamp()
        this.report_xhr.load_time = eTime - this.report_xhr.start_time
        triggerHandlers(EVENTTYPES.XHR, this.report_xhr)
      })
      originalSend.apply(this, args)
    }
  })
}

// function fetchReplace(): void {
//   if (!("fetch" in _global)) {
//     return;
//   }
//   replaceOld(_global, EVENTTYPES.FETCH, (originalFetch: voidFun) => {
//     return function (url: string, config: Partial<Request> = {}): void {
//       const sTime = getTimestamp();
//       const method = (config && config.method) || "GET";
//       let handlerData: REPORTHttp = {
//         type: HTTPTYPE.FETCH,
//         method,
//         reqData: config && config.body,
//         url,
//       };
//       const headers = new Headers(config.headers || {});
//       Object.assign(headers, {
//         setRequestHeader: headers.set,
//       });
//       setTraceId(url, (headerFieldName: string, traceId: string) => {
//         handlerData.traceId = traceId;
//         headers.set(headerFieldName, traceId);
//       });
//       options.beforeAppAjaxSend &&
//         options.beforeAppAjaxSend({ method, url }, headers);
//       config = {
//         ...config,
//         headers,
//       };

//       return originalFetch.apply(_global, [url, config]).then(
//         (res: Response) => {
//           const tempRes = res.clone();
//           const eTime = getTimestamp();
//           handlerData = {
//             ...handlerData,
//             elapsedTime: eTime - sTime,
//             status: tempRes.status,
//             // statusText: tempRes.statusText,
//             time: eTime,
//           };
//           tempRes.text().then((data) => {
//             if (
//               method === EMethods.Post &&
//               transportData.isSdkTransportUrl(url)
//             )
//               return;
//             if (isFilterHttpUrl(url)) return;
//             handlerData.responseText =
//               tempRes.status > HTTP_CODE.UNAUTHORIZED && data;
//             triggerHandlers(EVENTTYPES.FETCH, handlerData);
//           });
//           return res;
//         },
//         (err: Error) => {
//           const eTime = getTimestamp();
//           if (method === EMethods.Post && transportData.isSdkTransportUrl(url))
//             return;
//           if (isFilterHttpUrl(url)) return;
//           handlerData = {
//             ...handlerData,
//             elapsedTime: eTime - sTime,
//             status: 0,
//             // statusText: err.name + err.message,
//             time: eTime,
//           };
//           triggerHandlers(EVENTTYPES.FETCH, handlerData);
//           throw err;
//         }
//       );
//     };
//   });
// }

function listenHashchange(): void {
  if (!isExistProperty(_global, 'onpopstate')) {
    on(_global, EVENTTYPES.HASHCHANGE, function (e: HashChangeEvent) {
      triggerHandlers(EVENTTYPES.HASHCHANGE, e)
    })
  }
}

function listenError(): void {
  on(
    _global,
    'error',
    function (e: ErrorEvent) {
      triggerHandlers(EVENTTYPES.ERROR, e)
    },
    true
  )
}

// 上一次的路由
let lastHref: string
lastHref = getLocationHref()
function historyReplace(): void {
  if (!supportsHistory()) return
  const oldOnpopstate = _global.onpopstate
  _global.onpopstate = function (this: WindowEventHandlers, ...args: any[]): any {
    const to = getLocationHref()
    const from = lastHref
    triggerHandlers(EVENTTYPES.HISTORY, {
      from,
      to
    })
    oldOnpopstate && oldOnpopstate.apply(this, args)
  }
  function historyReplaceFn(originalHistoryFn: voidFun): voidFun {
    return function (this: History, ...args: any[]): void {
      const url = args.length > 2 ? args[2] : undefined
      if (url) {
        const from = lastHref
        const to = String(url)
        lastHref = to
        triggerHandlers(EVENTTYPES.HISTORY, {
          from,
          to
        })
      }
      return originalHistoryFn.apply(this, args)
    }
  }
  replaceOld(_global.history, 'pushState', historyReplaceFn)
  replaceOld(_global.history, 'replaceState', historyReplaceFn)
}

function unhandledrejectionReplace(): void {
  on(_global, EVENTTYPES.UNHANDLEDREJECTION, function (ev: PromiseRejectionEvent) {
    // ev.preventDefault() 阻止默认行为后，控制台就不会再报红色错误
    triggerHandlers(EVENTTYPES.UNHANDLEDREJECTION, ev)
  })
}

function domReplace(): void {
  if (!('document' in _global)) return
  on(
    _global.document,
    'click',
    function (ev) {
      triggerHandlers(EVENTTYPES.DOM, ev)
    },
    true
  )
}
function PerformanceReplace(): void {
  on(_global, 'load', function () {
    const performance = window.performance.getEntriesByType('navigation')[0]
    triggerHandlers(EVENTTYPES.PERFORMANCE, performance)
  })
}

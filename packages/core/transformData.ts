import { ActionTypeKeys, ErrorReport, PerformanceReport, ResourceErrorReport, ResourceErrorTarget } from '../types/common'
import { each, getTimestamp } from '../utils/helpers'
import ErrorStackParser from 'error-stack-parser'

const resourceMap = {
  img: '图片',
  script: 'js脚本'
}

export function resourceTransform(target: ResourceErrorTarget): ResourceErrorReport {
  return {
    action_type: 'RESOURCEERROR',
    happen_time: getTimestamp(),
    source_url: target.src.slice(0, 100) || target.href.slice(0, 100),
    element_type: resourceMap[target.localName] || target.localName
  }
}

export function errorTransform(target: ErrorEvent): ErrorReport {
  const stacks = ErrorStackParser.parse(target.error)
  const error_name = target.error.stack.split(':')[0]
  return {
    action_type: 'JSERROR',
    message: `${target.error.message}`,
    stack_frames: JSON.stringify(stacks) || '',
    happen_time: getTimestamp(),
    error_name,
    component_name: target.filename
  }
}

export function performanceTransform(callback: (data: PerformanceReport) => void): void {
  // redirect: transformNumber(performance.redirectEnd - performance.redirectStart),
  // appcache: transformNumber(performance.domainLookupStart - performance.fetchStart),
  // lookup_domain: transformNumber(performance.domainLookupEnd - performance.domainLookupStart),
  // tcp: transformNumber(performance.connectEnd - performance.connectStart),
  // ssl: transformNumber(performance.connectEnd - performance.secureConnectionStart),
  // request: transformNumber(performance.responseEnd - performance.requestStart),
  // dom_parse: performance.loadEventEnd == 0 ? 0 : transformNumber(performance.loadEventEnd - performance.domComplete),
  // // 首个字节
  // ttfb: transformNumber(performance.responseStart - performance.fetchStart),
  // // 页面加载所需时常
  // load_page: performance.loadEventEnd == 0 ? 0 : transformNumber(performance.loadEventEnd - performance.fetchStart),
  // // load event 时间
  // load_event: performance.loadEventEnd == 0 ? 0 : transformNumber(performance.loadEventEnd - performance.loadEventStart),
  // happen_time: parseInt(localStorage.getItem('performance_happen_time'))
  const TIMING_KEYS = [
    '', // 0
    'fetchStart', // 1
    'domainLookupStart', // 2
    'domainLookupEnd', // 3
    'connectStart', // 4
    'connectEnd', // 5
    'requestStart', // 6
    'responseStart', // 7
    'responseEnd', // 8
    '', // 9
    'domInteractive', // 10
    '', // 11
    'domContentLoadedEventEnd', // 12
    '', // 13
    'loadEventStart', // 14
    '', // 0
    'msFirstPaint', // 15
    'secureConnectionStart', // 16
    'redirectStart',
    'redirectEnd'
  ]
  let timing = null
  let type = 1
  const data: PerformanceReport = {
    dns: 0,
    tcp: 0,
    ssl: 0,
    ttfb: 0,
    request: 0,
    dom: 0,
    response: 0,
    firstbyte: 0,
    fpt: 0,
    tti: 0,
    ready: 0,
    load: 0,
    redirect: 0,
    appcache: 0,
    load_type: 1,
    action_type: ActionTypeKeys[0],
    happen_time: 0
  }
  const stateCheck = setInterval(() => {
    if (performance.timing.loadEventEnd) {
      clearInterval(stateCheck)
      // 根据PerformanceNavigationTiming计算更准确
      if ('function' == typeof window.PerformanceNavigationTiming) {
        const c = performance.getEntriesByType('navigation')[0]
        c && ((timing = c), (type = 2), (data.load_type = 2))
      }
      data.happen_time = getTimestamp()
      each(
        {
          redirect: [18, 17],
          appcache: [2, 1],
          dns: [3, 2],
          tcp: [5, 4],
          ssl: [5, 17],
          ttfb: [7, 6],
          request: [8, 7],
          dom: [10, 8],
          response: [14, 12],
          firstbyte: [7, 2],
          fpt: [8, 1],
          tti: [10, 1],
          ready: [12, 1],
          load: [14, 1]
        },
        (e: Array<number>, t: string) => {
          const r = timing[TIMING_KEYS[e[1]]]
          const o = timing[TIMING_KEYS[e[0]]]
          let c = Math.round(o - r)
          if (2 === type || (r !== undefined && o !== undefined)) {
            if (t === 'dom') {
              c = Math.round(o - r)
            }
            c >= 0 && c < 36e5 && (data[t] = c)
          }
        }
      )
      callback(data)
    }
  }, 50)
}

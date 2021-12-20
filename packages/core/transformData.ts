import { ResourceErrorTarget } from '../types/common'
import { getTimestamp } from '../utils/helpers'
import ErrorStackParser from 'error-stack-parser'

const resourceMap = {
  img: '图片',
  script: 'js脚本'
}

export function resourceTransform(target: ResourceErrorTarget) {
  return {
    action_type: 'RESOURCE',
    happen_time: getTimestamp(),
    source_url: target.src.slice(0, 100) || target.href.slice(0, 100),
    element_type: resourceMap[target.localName] || target.localName
  }
}

export function jsErrorTransform(target: ErrorEvent) {
  const stacks = ErrorStackParser.parse(target.error)
  const error_name = target.error.stack.split(':')[0]
  return {
    action_type: 'JS_ERROR',
    message: `${target.error.message}`,
    stack: target.error.stack,
    stack_frames: JSON.stringify(stacks) || '',
    happen_time: getTimestamp(),
    error_name,
    component_name: target.filename
  }
}

export function rerformanceTransform(performance) {
  return {
    load_type: performance.type,
    action_type: 'PAGE_LOAD',
    redirect: transformNumber(performance.redirectEnd - performance.redirectStart),
    appcache: transformNumber(performance.domainLookupStart - performance.fetchStart),
    lookup_domain: transformNumber(performance.domainLookupEnd - performance.domainLookupStart),
    tcp: transformNumber(performance.connectEnd - performance.connectStart),
    ssl: transformNumber(performance.connectEnd - performance.secureConnectionStart),
    request: transformNumber(performance.responseEnd - performance.requestStart),
    dom_parse: performance.loadEventEnd == 0 ? 0 : transformNumber(performance.loadEventEnd - performance.domComplete),
    // 首个字节
    ttfb: transformNumber(performance.responseStart - performance.fetchStart),
    // 页面加载所需时常
    load_page: performance.loadEventEnd == 0 ? 0 : transformNumber(performance.loadEventEnd - performance.fetchStart),
    // load event 时间
    load_event: performance.loadEventEnd == 0 ? 0 : transformNumber(performance.loadEventEnd - performance.loadEventStart),
    happen_time: parseInt(localStorage.getItem('performance_happen_time'))
  }
}

function transformNumber(number) {
  return parseFloat(number.toFixed(2))
}

import { ResourceErrorTarget } from '../types/common'
import { transportData } from '../core/transportData'
import { ERRORTYPES, ERROR_TYPE_RE } from '../shared'
import { getLocationHref, getTimestamp } from '../utils/helpers'
import { rerformanceTransform, resourceTransform } from '../core/transformData'

const HandleEvents = {
  handleDomOperation(event) {
    console.log(event.path?.map(item => item.tagName).filter(Boolean), "event");
    const data = {
      class_name: event.target.className,
      inner_text: event.target.innerText,
      tag_name: event.target.tagName,
      behavior_type: event.type,
      input_value: event.target.inputValue,
      placeholder: event.target.placeholder,
      sub_type: 'OPERATION',
      happen_time: getTimestamp(),
    }
    transportData.send(data)
  },
  /**
   * 处理xhr、fetch回调
   */
  handleHttp(data): void {
    transportData.send(data)
  },
  /**
   * 处理window的error的监听回到
   */
  handleError(errorEvent: ErrorEvent) {
    const target = errorEvent.target as ResourceErrorTarget
    if (target.localName) {
      // 资源加载错误 提取有用数据
      const data = resourceTransform(errorEvent.target as ResourceErrorTarget)
      return transportData.send(data)
    }
    // 这里暂时先注释后面再去搞。
  },
  handleNotErrorInstance(message: string, filename: string, lineno: number, colno: number) {
    let name: string | ERRORTYPES = ERRORTYPES.UNKNOWN
    const url = filename || getLocationHref()
    let msg = message
    const matches = message.match(ERROR_TYPE_RE)
    if (matches[1]) {
      name = matches[1]
      msg = matches[2]
    }
    const element = {
      url,
      func: ERRORTYPES.UNKNOWN_FUNCTION,
      args: ERRORTYPES.UNKNOWN,
      line: lineno,
      col: colno
    }
    return {
      url,
      name,
      message: msg,
      time: getTimestamp(),
      stack: [element]
    }
  },
  handleHistory(data: any): void {
    const history = {
      page_url: data.to,
      sub_type: 'PAGE_VIEW',
      happen_time: getTimestamp(),
    }
    transportData.send(history)
  },
  handleHashchange(data: HashChangeEvent): void {
    const history = {
      page_url: data.newURL,
      sub_type: 'PAGE_VIEW',
      happen_time: getTimestamp(),
    }
    transportData.send(history)
  },
  handleUnhandleRejection(event: PromiseRejectionEvent): void {
    console.log(event, "ev");
  },
  performanceReplace(data): void {
    // 这里是用微任务延迟下，不然的话 loadEventEnd 一些会为0
    setTimeout(() => {
      const performance = rerformanceTransform(data)
      transportData.send(performance)
    })
  }
}

export { HandleEvents }

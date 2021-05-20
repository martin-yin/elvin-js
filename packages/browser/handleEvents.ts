import { ResourceErrorTarget } from '../types/common'
import { transportData } from '../core/transportData'
import { ERRORTYPES, ERROR_TYPE_RE } from '../shared'

import { getLocationHref, getTimestamp, getYMDHMS } from '../utils/helpers'
import { rerformanceTransform, resourceTransform } from '../core/transformData'

const HandleEvents = {
  handleDomOperation(event) {
    const data = {
      page_url: getLocationHref(),
      class_name: event.target.className,
      inner_text: event.target.innerText,
      tag_name: event.target.nodeName,
      behavior_type: event.type,
      input_value: event.target.inputValue,
      placeholder: event.target.placeholder,
      action_type: 'OPERATION',
      happen_time: getTimestamp(),
      happen_day: getYMDHMS()
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
    // const { message, filename, lineno, colno, error } = errorEvent;
    // let result: any;
    // if (error && isError(error)) {
    //   result = extractErrorStack(error, "");
    // }
    // // 处理SyntaxError，stack没有lineno、colno
    // result ||
    //   (result = HandleEvents.handleNotErrorInstance(
    //     message,
    //     filename,
    //     lineno,
    //     colno
    //   ));
    // result.type = ERRORTYPES.JAVASCRIPT_ERROR;
    // console.log(result, "result");
    // transportData.send(result);
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
      action_type: 'PAGE_VIEW',
      happen_time: getTimestamp(),
      happen_day: getYMDHMS()
    }
    transportData.send(history)
  },
  handleHashchange(data: HashChangeEvent): void {
    const history = {
      page_url: data.newURL,
      action_type: 'PAGE_VIEW',
      happen_time: getTimestamp(),
      happen_day: getYMDHMS()
    }
    transportData.send(history)
  },
  handleUnhandleRejection(ev: PromiseRejectionEvent): void {
    // let data: ReportDataType = {
    //   type: ERRORTYPES.PROMISE_ERROR,
    //   message: unknownToString(ev.reason),
    //   url: getLocationHref(),
    //   name: ev.type,
    //   time: getTimestamp(),
    //   level: "Severity.High",
    // };
    // if (isError(ev.reason)) {
    //   data = {
    //     ...data,
    //     ...extractErrorStack(ev.reason, "Severity.High"),
    //   };
    // }
    // transportData.send(data);
  },
  PerformanceReplace(data): void {
    // 这里是用微任务延迟下，不然的话 loadEventEnd 一些会为0
    setTimeout(() => {
      const performance = rerformanceTransform(data)
      transportData.send(performance)
    })
  }
}

export { HandleEvents }

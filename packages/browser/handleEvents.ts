import { ActionTypeKeys, HistryReport, HttpReport, ResourceErrorTarget } from '../types/common'
import { transportData } from '../core/transportData'
import { getElmPath, getTimestamp } from '../utils/helpers'
import { errorTransform, performanceTransform, resourceTransform } from '../core/transformData'

const HandleEvents = {
  handleDomOperation(event: Event) {
    const dom = event.target as HTMLElement
    const input = event.target as HTMLInputElement
    const data = {
      class_name: dom.className,
      inner_text: dom.innerText,
      tag_name: dom.tagName,
      behavior_type: event.type,
      input_value: input.value,
      placeholder: input.placeholder,
      action_type: ActionTypeKeys[5],
      happen_time: getTimestamp(),
      path: getElmPath(event.target)
    }
    if (data.path.indexOf('div') >= 0) {
      transportData.send(data as any)
    }
  },
  /**
   * 处理xhr、fetch回调
   */
  handleHttp(data: HttpReport): void {
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
    const data = errorTransform(target as ErrorEvent)
    transportData.send(data)
  },
  handleHistory(data: any): void {
    HandleEvents.handlePv(data)
  },
  handleHashchange(data: HashChangeEvent): void {
    HandleEvents.handlePv(data)
  },
  handleUnhandleRejection(event: PromiseRejectionEvent): void {
    const data = errorTransform(event, true)
    transportData.send(data)
  },
  handlePerformance(): void {
    const performance = window.performance
    if (!performance || 'object' !== typeof performance) return
    performanceTransform((data) => {
      transportData.send(data)
    })
  },
  handlePv(data: HashChangeEvent): void {
    const history: HistryReport = {
      page_url: data.newURL,
      action_type: ActionTypeKeys[1],
      document_title: document.title,
      referrer: data.oldURL,
      encode: document.charset,
      happen_time: getTimestamp()
    }
    transportData.send(history)
  }
}

export { HandleEvents }

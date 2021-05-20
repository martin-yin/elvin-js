import { InitOptions } from '../types/options'
import { generateUUID } from '../utils/helpers'
import { _support } from './global'
import { transportData } from './transportData'
export class Options {
  enableTraceId: Boolean
  includeHttpUrlTraceIdRegExp: RegExp
  traceIdFieldName = 'Trace-Id'

  constructor() {
    this.enableTraceId = false
  }
}

const options = _support.options || (_support.options = new Options())

export function setTraceId(httpUrl: string, callback: (headerFieldName: string, traceId: string) => void) {
  const { includeHttpUrlTraceIdRegExp, enableTraceId } = options
  if (enableTraceId && includeHttpUrlTraceIdRegExp && includeHttpUrlTraceIdRegExp.test(httpUrl)) {
    const traceId = generateUUID()
    callback(options.traceIdFieldName, traceId)
  }
}

/**
 * init core methods
 * @param paramOptions
 */
export function initOptions(paramOptions: InitOptions) {
  // setSilentFlag(paramOptions);
  // breadcrumb.bindOptions(paramOptions);
  // logger.bindOptions(paramOptions.debug);
  transportData.bindOptions(paramOptions)
}

export { options }

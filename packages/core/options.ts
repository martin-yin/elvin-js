import { InitOptions } from '../types/options'
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

/**
 * init core methods
 * @param paramOptions
 */
export function initOptions(paramOptions: InitOptions) {
  // setSilentFlag(paramOptions);
  transportData.bindOptions(paramOptions)
}

export { options }

export * from './handleEvents'
export * from './load'
export * from './replace'
import { generateUUID, getTimestamp } from '../utils/helpers'

import { SDK_NAME, SDK_VERSION } from '../shared'
import { InitOptions } from '../types/options'

import { setupReplace } from './load'
import { _global } from '../core/global'
import { initOptions } from '../core/options'

function webInit(options: InitOptions): void {
  if (!('XMLHttpRequest' in _global) || options.disabled) return
  options.eventId = generateUUID()
  const userId = localStorage.getItem('userId')
  if (userId) {
    options.userId = userId
  } else {
    const userId = generateUUID()
    options.userId = userId
    localStorage.setItem('userId', userId)
  }
  initOptions(options)
  setupReplace()
  localStorage.setItem('performance_happen_time', getTimestamp().toString())
}

function init(options: InitOptions): void {
  webInit(options)
}

export { SDK_VERSION, SDK_NAME, init }

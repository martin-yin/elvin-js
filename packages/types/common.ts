import { HTTPTYPE } from '../shared'
import { HttpMethod } from './options'

export const ActionTypeKeys = ['PERFORMANCE', 'PAGE_VIEW', 'RESOURCE_ERROR', 'JS_ERROR', 'HTTP_LOG', 'OPERATION'] as const

export interface IAnyObject {
  [key: string]: any
}

export interface ResourceErrorTarget {
  src?: string
  href?: string
  localName?: string
}

type ActionTypes = {
  action_type: typeof ActionTypeKeys[number]
}

export interface HttpReport extends ActionTypes {
  method: HttpMethod
  url: string
  type: HTTPTYPE
  http_url: string
  status: number
  status_text: string
  happen_day: string
  response_text: string
  request_text: string
  happen_time: number
  load_time: number
}

export interface REPORTXMLHttpRequest extends XMLHttpRequest {
  [key: string]: any
  before_report_data: {
    method: HttpMethod
    url: string
    http_url: string
    type: HTTPTYPE
  }
}

export type ResourceErrorReport = Record<'source_url' | 'element_type', string> & Record<'happen_time', number> & ActionTypes

export type ErrorReport = Record<'message' | 'stack_frames' | 'stack' | 'error_name' | 'component_name', string> &
  Record<'happen_time', number> &
  ActionTypes

export type HistryReport = Record<'page_url' | 'document_title' | 'referrer' | 'encode', string> &
  Record<'happen_time', number> &
  ActionTypes

export interface PerformanceReport extends ActionTypes {
  dns: number
  tcp: number
  ssl: number
  ttfb: number
  request: number
  dom: number
  response: number
  first_byte: number
  fpt: number
  tti: number
  ready: number
  load: number
  redirect: number
  appcache: number
  load_type: string
  happen_time: number
}

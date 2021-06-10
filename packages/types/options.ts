export type HttpMethod = 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE' | 'OPTIONS'

export enum EMethods {
  Get = 'GET',
  Post = 'POST',
  Put = 'PUT',
  Delete = 'DELETE'
}

export interface InitOptions {
  userId?: string
  eventId?: string
  monitorId: string
  reportUrl?: string
  disabled?: boolean
}

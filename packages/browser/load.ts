import { EVENTTYPES } from '../shared'
import { HandleEvents } from './handleEvents'
import { addReplaceHandler } from './replace'

export function setupReplace(): void {
  addReplaceHandler({
    callback: (e: any) => {
      HandleEvents.performanceReplace(e)
    },
    type: EVENTTYPES.PERFORMANCE
  })
  addReplaceHandler({
    callback: (data) => {
      HandleEvents.handleHttp(data)
    },
    type: EVENTTYPES.XHR
  })
  addReplaceHandler({
    callback: (data) => {
      HandleEvents.handleHttp(data)
    },
    type: EVENTTYPES.FETCH
  })
  addReplaceHandler({
    callback: (error) => {
      HandleEvents.handleError(error);
    },
    type: EVENTTYPES.ERROR,
  });
  addReplaceHandler({
    callback: (data) => {
      HandleEvents.handleHistory(data)
    },
    type: EVENTTYPES.HISTORY
  })
  addReplaceHandler({
    callback: (data) => {
      HandleEvents.handleUnhandleRejection(data)
    },
    type: EVENTTYPES.UNHANDLEDREJECTION
  })
  addReplaceHandler({
    callback: (data) => {
      HandleEvents.handleDomOperation(data)
    },
    type: EVENTTYPES.DOM,
  });
  addReplaceHandler({
    callback: (e: HashChangeEvent) => {
      HandleEvents.handleHashchange(e)
    },
    type: EVENTTYPES.HASHCHANGE
  })
}

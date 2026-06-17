import type { AppBridgeEvent } from '../events'
import { AppBridgeError } from '../errors'
import type { AppBridgeTransport } from '../transport'

type AnyEventHandler = (payload: unknown) => void

export function createMockTransport(): AppBridgeTransport {
  const eventHandlers = new Map<AppBridgeEvent, Set<AnyEventHandler>>()

  return {
    async call(request) {
      switch (request.method) {
        case 'device.getInfo':
          return { platform: 'web' }
        case 'device.getSafeArea':
          return { top: 0, right: 0, bottom: 0, left: 0 }
        case 'browser.open':
          return { success: true }
        case 'auth.tokenExpired':
          return { success: true }
        default:
          throw new AppBridgeError('UNSUPPORTED_METHOD', `${request.method} is not supported by mock transport`)
      }
    },
    emit(request) {
      dispatch(request.method as AppBridgeEvent, request.payload)
    },
    on(event, handler) {
      const handlers = eventHandlers.get(event) ?? new Set<AnyEventHandler>()
      handlers.add(handler as AnyEventHandler)
      eventHandlers.set(event, handlers)

      return () => {
        handlers.delete(handler as AnyEventHandler)
      }
    },
  }

  function dispatch(event: AppBridgeEvent, payload: unknown) {
    const handlers = eventHandlers.get(event)

    if (handlers === undefined) {
      return
    }

    handlers.forEach((handler) => handler(payload))
  }
}

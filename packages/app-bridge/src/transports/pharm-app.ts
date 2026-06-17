import { AppBridgeError } from '../errors'
import type { AppBridgeTransport } from '../transport'

export function createPharmAppTransport(): AppBridgeTransport {
  return {
    async call(request) {
      if (window.PharmApp?.call === undefined) {
        throw new AppBridgeError('UNSUPPORTED_METHOD', 'window.PharmApp.call is not available')
      }

      return window.PharmApp.call(request)
    },
    emit(request) {
      if (window.PharmApp?.emit === undefined) {
        throw new AppBridgeError('UNSUPPORTED_METHOD', 'window.PharmApp.emit is not available')
      }

      window.PharmApp.emit(request)
    },
    on(event, handler) {
      if (window.PharmApp?.on === undefined) {
        return () => undefined
      }

      return window.PharmApp.on(event, handler as (payload: unknown) => void)
    },
  }
}

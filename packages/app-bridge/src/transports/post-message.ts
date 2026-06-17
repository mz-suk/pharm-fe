import { encodeBridgePayload } from '../encoding'
import { AppBridgeError } from '../errors'
import type { AppBridgeTransport } from '../transport'

export function createPostMessageTransport(): AppBridgeTransport {
  return {
    async call(request) {
      if (window.FlutterWebView === undefined) {
        throw new AppBridgeError('UNSUPPORTED_METHOD', 'window.FlutterWebView is not available')
      }

      window.FlutterWebView.postMessage(encodeBridgePayload(request))
      throw new AppBridgeError('UNSUPPORTED_METHOD', 'postMessage request/response protocol is not finalized')
    },
    emit(request) {
      if (window.FlutterWebView === undefined) {
        throw new AppBridgeError('UNSUPPORTED_METHOD', 'window.FlutterWebView is not available')
      }

      window.FlutterWebView.postMessage(encodeBridgePayload(request))
    },
    on() {
      return () => undefined
    },
  }
}

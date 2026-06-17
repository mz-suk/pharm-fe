import type { AppBridgeEvent, AppBridgeEventHandler } from './events'
import type { AppBridgeMethod, AppBridgePayload, AppBridgeResult } from './methods'
import type { AppBridgeRequest } from './schema'
import type { AppBridgeTransport } from './transport'
import { createMockTransport } from './transports/mock'

type PayloadArgs<M extends AppBridgeMethod> =
  AppBridgePayload<M> extends undefined ? [payload?: undefined] : [payload: AppBridgePayload<M>]

let activeTransport: AppBridgeTransport = createMockTransport()

export function configureAppBridge(transport: AppBridgeTransport) {
  activeTransport = transport
}

export const appBridge = {
  async call<M extends AppBridgeMethod>(method: M, ...[payload]: PayloadArgs<M>): Promise<AppBridgeResult<M>> {
    const result = await activeTransport.call(createRequest(method, payload))

    return result as AppBridgeResult<M>
  },

  async emit<M extends AppBridgeMethod>(method: M, ...[payload]: PayloadArgs<M>) {
    await activeTransport.emit(createRequest(method, payload))
  },

  on<E extends AppBridgeEvent>(event: E, handler: AppBridgeEventHandler<E>) {
    return activeTransport.on(event, handler)
  },
}

function createRequest(method: string, payload: unknown): AppBridgeRequest {
  return {
    version: '1.0',
    id: createRequestId(),
    method,
    ...(payload !== undefined ? { payload } : {}),
  }
}

function createRequestId() {
  if (globalThis.crypto?.randomUUID !== undefined) {
    return globalThis.crypto.randomUUID()
  }

  return `req_${Date.now()}_${Math.random().toString(16).slice(2)}`
}

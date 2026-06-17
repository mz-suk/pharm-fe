import type { AppBridgeEvent, AppBridgeEventHandler } from './events'
import type { AppBridgeRequest } from './schema'

export interface AppBridgeTransport {
  call(request: AppBridgeRequest): Promise<unknown>
  emit(request: AppBridgeRequest): Promise<void> | void
  on<E extends AppBridgeEvent>(event: E, handler: AppBridgeEventHandler<E>): () => void
}

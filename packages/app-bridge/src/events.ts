export interface AppBridgeEventMap {
  'app.resume': undefined
  'auth.loginCompleted': {
    userId?: string
  }
  'auth.logout': undefined
}

export type AppBridgeEvent = keyof AppBridgeEventMap
export type AppBridgeEventPayload<E extends AppBridgeEvent> = AppBridgeEventMap[E]
export type AppBridgeEventHandler<E extends AppBridgeEvent> = (payload: AppBridgeEventPayload<E>) => void

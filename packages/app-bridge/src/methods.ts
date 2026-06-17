export interface AppBridgeMethodMap {
  'device.getInfo': {
    payload: undefined
    result: {
      platform: 'web' | 'ios' | 'android'
      appVersion?: string
    }
  }
  'device.getSafeArea': {
    payload: undefined
    result: {
      top: number
      right: number
      bottom: number
      left: number
    }
  }
  'browser.open': {
    payload: {
      url: string
    }
    result: {
      success: boolean
    }
  }
  'auth.tokenExpired': {
    payload: undefined
    result: {
      success: boolean
    }
  }
}

export type AppBridgeMethod = keyof AppBridgeMethodMap
export type AppBridgePayload<M extends AppBridgeMethod> = AppBridgeMethodMap[M]['payload']
export type AppBridgeResult<M extends AppBridgeMethod> = AppBridgeMethodMap[M]['result']

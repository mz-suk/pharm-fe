export interface AppBridgeRequest {
  version: '1.0'
  id: string
  method: string
  payload?: unknown
}

export interface AppBridgeSuccessResponse<T> {
  id: string
  ok: true
  result: T
}

export interface AppBridgeFailureResponse {
  id: string
  ok: false
  error: {
    code: string
    message: string
  }
}

export type AppBridgeResponse<T> = AppBridgeSuccessResponse<T> | AppBridgeFailureResponse
